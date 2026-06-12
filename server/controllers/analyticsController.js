const db = require('../config/db');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getOverview = async (req, res) => {
  try {
    const patientsCount = await db.query('SELECT COUNT(*) FROM patients');
    const doctorsCount = await db.query('SELECT COUNT(*) FROM doctors');
    const appointmentsCount = await db.query('SELECT COUNT(*) FROM appointments');
    
    // Revenue is calculated from consultation fees of completed appointments
    const revenueResult = await db.query(`
      SELECT COALESCE(SUM(d.consultation_fee), 0.00) as revenue
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.status = 'Completed'
    `);

    return sendSuccess(res, {
      totalPatients: parseInt(patientsCount.rows[0].count),
      totalDoctors: parseInt(doctorsCount.rows[0].count),
      totalAppointments: parseInt(appointmentsCount.rows[0].count),
      revenue: parseFloat(revenueResult.rows[0].revenue),
    }, 'Overview metrics fetched.');
  } catch (error) {
    console.error('Analytics Overview error:', error);
    return sendError(res, 'Internal server error calculating overview metrics.');
  }
};

exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT status, COUNT(*)::integer as count 
      FROM appointments 
      GROUP BY status
    `);
    return sendSuccess(res, result.rows, 'Appointments by status retrieved.');
  } catch (error) {
    console.error('AppointmentsByStatus error:', error);
    return sendError(res, 'Internal server error calculating status statistics.');
  }
};

exports.getAppointmentsByDepartment = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT dep.department_name, COUNT(a.appointment_id)::integer as count
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN departments dep ON d.department_id = dep.department_id
      GROUP BY dep.department_name
    `);
    return sendSuccess(res, result.rows, 'Appointments by department retrieved.');
  } catch (error) {
    console.error('AppointmentsByDepartment error:', error);
    return sendError(res, 'Internal server error calculating department statistics.');
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT TO_CHAR(appointment_date, 'YYYY-MM') as month, COUNT(*)::integer as count
      FROM appointments
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);
    return sendSuccess(res, result.rows, 'Monthly appointments statistics retrieved.');
  } catch (error) {
    console.error('MonthlyStats error:', error);
    return sendError(res, 'Internal server error calculating monthly statistics.');
  }
};
