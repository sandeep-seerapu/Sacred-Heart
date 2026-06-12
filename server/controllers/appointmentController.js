const db = require('../config/db');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getAllAppointments = async (req, res) => {
  const { id, role_name } = req.user;
  try {
    let queryText = `
      SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
             p.patient_id, up.name as patient_name, up.email as patient_email, p.phone as patient_phone,
             d.doctor_id, ud.name as doctor_name, ud.email as doctor_email, d.specialization,
             dep.department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users up ON p.user_id = up.id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users ud ON d.user_id = ud.id
      LEFT JOIN departments dep ON d.department_id = dep.department_id`;
    
    const params = [];

    if (role_name === 'patient') {
      params.push(id);
      queryText += ` WHERE p.user_id = $1`;
    } else if (role_name === 'doctor') {
      params.push(id);
      queryText += ` WHERE d.user_id = $1`;
    }

    queryText += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await db.query(queryText, params);
    return sendSuccess(res, result.rows, 'Appointments retrieved successfully.');
  } catch (error) {
    console.error('GetAllAppointments error:', error);
    return sendError(res, 'Internal server error retrieving appointments.');
  }
};

exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const queryText = `
      SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
             p.patient_id, p.user_id as patient_user_id, up.name as patient_name, up.email as patient_email, p.phone as patient_phone,
             d.doctor_id, d.user_id as doctor_user_id, ud.name as doctor_name, ud.email as doctor_email, d.specialization,
             dep.department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users up ON p.user_id = up.id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users ud ON d.user_id = ud.id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      WHERE a.appointment_id = $1`;
    
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Appointment not found.', 404);
    }

    const appointment = result.rows[0];

    // Access control
    if (user.role_name === 'patient' && appointment.patient_user_id !== user.id) {
      return sendError(res, 'Access denied.', 403);
    }
    if (user.role_name === 'doctor' && appointment.doctor_user_id !== user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    return sendSuccess(res, appointment, 'Appointment details retrieved.');
  } catch (error) {
    console.error('GetAppointmentById error:', error);
    return sendError(res, 'Internal server error retrieving appointment.');
  }
};

exports.bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, notes } = req.body;
  const userId = req.user.id;
  const roleName = req.user.role_name;

  try {
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return sendError(res, 'Doctor ID, date, and time are required.', 400);
    }

    // Resolve patient_id from current user if patient, or accept in body if admin
    let patientId;
    if (roleName === 'patient') {
      const patientResult = await db.query('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
      if (patientResult.rows.length === 0) {
        return sendError(res, 'Patient profile not found.', 400);
      }
      patientId = patientResult.rows[0].patient_id;
    } else if (roleName === 'admin') {
      patientId = req.body.patientId;
      if (!patientId) {
        return sendError(res, 'Patient ID is required for administrator booking.', 400);
      }
    } else {
      return sendError(res, 'Only patients or administrators can book appointments.', 403);
    }

    // Check availability slot collision
    const collisionCheck = await db.query(
      `SELECT appointment_id FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (collisionCheck.rows.length > 0) {
      return sendError(res, 'This appointment slot is already booked. Please choose another time.', 400);
    }

    // Book appointment
    const newAppointment = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending')
       RETURNING *`,
      [patientId, doctorId, appointmentDate, appointmentTime, notes || '']
    );

    // Create notifications for the doctor
    const doctorUser = await db.query('SELECT user_id FROM doctors WHERE doctor_id = $1', [doctorId]);
    if (doctorUser.rows.length > 0) {
      const doctorUserId = doctorUser.rows[0].user_id;
      const patientUser = await db.query('SELECT name FROM users WHERE id = $1', [userId]);
      const patientName = patientUser.rows[0]?.name || 'A patient';
      
      await db.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [doctorUserId, `New appointment requested by ${patientName} on ${appointmentDate} at ${appointmentTime}.`]
      );
    }

    return sendSuccess(res, newAppointment.rows[0], 'Appointment booked successfully as Pending approval.', 201);
  } catch (error) {
    console.error('BookAppointment error:', error);
    return sendError(res, 'Internal server error booking appointment.');
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params; // appointment_id
  const { status } = req.body; // Pending, Confirmed, Completed, Cancelled
  const { id: userId, role_name } = req.user;

  try {
    if (!status) {
      return sendError(res, 'Status is required.', 400);
    }

    // Fetch the appointment
    const appointmentResult = await db.query(
      `SELECT a.*, p.user_id as patient_user_id, d.user_id as doctor_user_id 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE a.appointment_id = $1`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      return sendError(res, 'Appointment not found.', 404);
    }

    const appointment = appointmentResult.rows[0];

    // Authorization checks
    if (role_name === 'patient' && appointment.patient_user_id !== userId) {
      return sendError(res, 'Access denied.', 403);
    }
    if (role_name === 'doctor' && appointment.doctor_user_id !== userId) {
      return sendError(res, 'Access denied.', 403);
    }

    // Patients can only "Cancel" their appointments
    if (role_name === 'patient' && status !== 'Cancelled') {
      return sendError(res, 'Patients can only cancel appointments.', 403);
    }

    // Update status
    const updated = await db.query(
      'UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
      [status, id]
    );

    // Create notifications for patient/doctor depending on who triggered it
    if (role_name === 'doctor' || role_name === 'admin') {
      // Notify patient
      await db.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [appointment.patient_user_id, `Your appointment on ${appointment.appointment_date} has been ${status.toLowerCase()}.`]
      );
    } else if (role_name === 'patient' && status === 'Cancelled') {
      // Notify doctor
      await db.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [appointment.doctor_user_id, `Appointment on ${appointment.appointment_date} was cancelled by the patient.`]
      );
    }

    return sendSuccess(res, updated.rows[0], `Appointment status updated to ${status}.`);
  } catch (error) {
    console.error('UpdateAppointmentStatus error:', error);
    return sendError(res, 'Internal server error updating appointment status.');
  }
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM appointments WHERE appointment_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Appointment not found.', 404);
    }
    return sendSuccess(res, null, 'Appointment deleted successfully.');
  } catch (error) {
    console.error('DeleteAppointment error:', error);
    return sendError(res, 'Internal server error deleting appointment.');
  }
};
