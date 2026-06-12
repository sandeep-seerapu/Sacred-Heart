const db = require('../config/db');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getAllRecords = async (req, res) => {
  const { id, role_name } = req.user;
  try {
    let queryText = `
      SELECT r.record_id, r.diagnosis, r.treatment, r.visit_date, r.notes,
             p.patient_id, up.name as patient_name, up.email as patient_email, p.age, p.gender,
             d.doctor_id, ud.name as doctor_name, d.specialization,
             pr.prescription_id, pr.medicines, pr.dosage, pr.duration, pr.instructions
      FROM medical_records r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users up ON p.user_id = up.id
      JOIN doctors d ON r.doctor_id = d.doctor_id
      JOIN users ud ON d.user_id = ud.id
      LEFT JOIN prescriptions pr ON r.record_id = pr.record_id`;
    
    const params = [];

    if (role_name === 'patient') {
      params.push(id);
      queryText += ` WHERE p.user_id = $1`;
    } else if (role_name === 'doctor') {
      params.push(id);
      queryText += ` WHERE d.user_id = $1`;
    }

    queryText += ` ORDER BY r.visit_date DESC`;

    const result = await db.query(queryText, params);
    return sendSuccess(res, result.rows, 'Medical records retrieved.');
  } catch (error) {
    console.error('GetAllRecords error:', error);
    return sendError(res, 'Internal server error retrieving medical records.');
  }
};

exports.getRecordById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const queryText = `
      SELECT r.record_id, r.diagnosis, r.treatment, r.visit_date, r.notes,
             p.patient_id, p.user_id as patient_user_id, up.name as patient_name, up.email as patient_email, p.age, p.gender, p.blood_group,
             d.doctor_id, d.user_id as doctor_user_id, ud.name as doctor_name, d.specialization,
             pr.prescription_id, pr.medicines, pr.dosage, pr.duration, pr.instructions
      FROM medical_records r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users up ON p.user_id = up.id
      JOIN doctors d ON r.doctor_id = d.doctor_id
      JOIN users ud ON d.user_id = ud.id
      LEFT JOIN prescriptions pr ON r.record_id = pr.record_id
      WHERE r.record_id = $1`;

    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Medical record not found.', 404);
    }

    const record = result.rows[0];

    // Access control
    if (user.role_name === 'patient' && record.patient_user_id !== user.id) {
      return sendError(res, 'Access denied.', 403);
    }
    if (user.role_name === 'doctor' && record.doctor_user_id !== user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    return sendSuccess(res, record, 'Medical record details retrieved.');
  } catch (error) {
    console.error('GetRecordById error:', error);
    return sendError(res, 'Internal server error retrieving medical record.');
  }
};

exports.createRecord = async (req, res) => {
  const { patientId, diagnosis, treatment, visitDate, notes, medicines, dosage, duration, instructions } = req.body;
  const doctorUserId = req.user.id;
  const client = await db.pool.connect();

  try {
    if (!patientId || !diagnosis) {
      return sendError(res, 'Patient ID and diagnosis are required.', 400);
    }

    await client.query('BEGIN');

    // Get doctor_id from user context
    const doctorResult = await client.query('SELECT doctor_id FROM doctors WHERE user_id = $1', [doctorUserId]);
    if (doctorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Doctor profile not found for active user.', 403);
    }
    const doctorId = doctorResult.rows[0].doctor_id;

    // Create medical record
    const recordResult = await client.query(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, visit_date, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6)
       RETURNING *`,
      [patientId, doctorId, diagnosis, treatment || '', visitDate, notes || '']
    );
    const newRecord = recordResult.rows[0];

    // If prescription details are provided, insert prescription
    let prescription = null;
    if (medicines) {
      const prescriptionResult = await client.query(
        `INSERT INTO prescriptions (record_id, medicines, dosage, duration, instructions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [newRecord.record_id, medicines, dosage || '', duration || '', instructions || '']
      );
      prescription = prescriptionResult.rows[0];
    }

    await client.query('COMMIT');
    return sendSuccess(res, { ...newRecord, prescription }, 'Medical record and prescription created successfully.', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CreateRecord error:', error);
    return sendError(res, 'Internal server error creating medical record.');
  } finally {
    client.release();
  }
};

exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const { diagnosis, treatment, visitDate, notes } = req.body;
  try {
    const updated = await db.query(
      `UPDATE medical_records 
       SET diagnosis = COALESCE($1, diagnosis),
           treatment = COALESCE($2, treatment),
           visit_date = COALESCE($3, visit_date),
           notes = COALESCE($4, notes)
       WHERE record_id = $5 RETURNING *`,
      [diagnosis, treatment, visitDate, notes, id]
    );

    if (updated.rows.length === 0) {
      return sendError(res, 'Medical record not found.', 404);
    }

    return sendSuccess(res, updated.rows[0], 'Medical record updated successfully.');
  } catch (error) {
    console.error('UpdateRecord error:', error);
    return sendError(res, 'Internal server error updating medical record.');
  }
};

exports.deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM medical_records WHERE record_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Medical record not found.', 404);
    }
    return sendSuccess(res, null, 'Medical record deleted successfully.');
  } catch (error) {
    console.error('DeleteRecord error:', error);
    return sendError(res, 'Internal server error deleting medical record.');
  }
};
