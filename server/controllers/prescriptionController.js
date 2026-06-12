const db = require('../config/db');
const { generatePrescriptionPDF } = require('../utils/generatePDF');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getPrescriptionByRecordId = async (req, res) => {
  const { record_id } = req.params;
  try {
    const result = await db.query('SELECT * FROM prescriptions WHERE record_id = $1', [record_id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Prescription not found.', 404);
    }
    return sendSuccess(res, result.rows[0], 'Prescription retrieved successfully.');
  } catch (error) {
    console.error('GetPrescription error:', error);
    return sendError(res, 'Internal server error retrieving prescription.');
  }
};

exports.createPrescription = async (req, res) => {
  const { recordId, medicines, dosage, duration, instructions } = req.body;
  try {
    if (!recordId || !medicines) {
      return sendError(res, 'Record ID and medicines list are required.', 400);
    }

    const checkRecord = await db.query('SELECT record_id FROM medical_records WHERE record_id = $1', [recordId]);
    if (checkRecord.rows.length === 0) {
      return sendError(res, 'Associated medical record does not exist.', 404);
    }

    const result = await db.query(
      `INSERT INTO prescriptions (record_id, medicines, dosage, duration, instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [recordId, medicines, dosage || '', duration || '', instructions || '']
    );

    return sendSuccess(res, result.rows[0], 'Prescription created successfully.', 201);
  } catch (error) {
    console.error('CreatePrescription error:', error);
    return sendError(res, 'Internal server error creating prescription.');
  }
};

exports.updatePrescription = async (req, res) => {
  const { id } = req.params;
  const { medicines, dosage, duration, instructions } = req.body;
  try {
    const updated = await db.query(
      `UPDATE prescriptions
       SET medicines = COALESCE($1, medicines),
           dosage = COALESCE($2, dosage),
           duration = COALESCE($3, duration),
           instructions = COALESCE($4, instructions)
       WHERE prescription_id = $5 RETURNING *`,
      [medicines, dosage, duration, instructions, id]
    );

    if (updated.rows.length === 0) {
      return sendError(res, 'Prescription not found.', 404);
    }

    return sendSuccess(res, updated.rows[0], 'Prescription updated successfully.');
  } catch (error) {
    console.error('UpdatePrescription error:', error);
    return sendError(res, 'Internal server error updating prescription.');
  }
};

exports.deletePrescription = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM prescriptions WHERE prescription_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Prescription not found.', 404);
    }
    return sendSuccess(res, null, 'Prescription deleted successfully.');
  } catch (error) {
    console.error('DeletePrescription error:', error);
    return sendError(res, 'Internal server error deleting prescription.');
  }
};

exports.downloadPrescriptionPDF = async (req, res) => {
  const { id } = req.params; // prescription_id or record_id? Let's check both or design it for prescription_id
  try {
    // Fetch prescription details joined with medical records, patient name, doctor name, and departments
    const queryText = `
      SELECT pr.prescription_id, pr.medicines, pr.dosage, pr.duration, pr.instructions,
             r.record_id, r.diagnosis, r.treatment, r.visit_date, r.notes as record_notes,
             p.age, p.gender, p.blood_group, up.name as patient_name,
             ud.name as doctor_name, d.specialization, dep.department_name
      FROM prescriptions pr
      JOIN medical_records r ON pr.record_id = r.record_id
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users up ON p.user_id = up.id
      JOIN doctors d ON r.doctor_id = d.doctor_id
      JOIN users ud ON d.user_id = ud.id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      WHERE pr.prescription_id = $1 OR r.record_id = $1`;
    
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Prescription data not found.', 404);
    }

    const prescriptionData = result.rows[0];

    // Generate and pipe the PDF document directly to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescriptionData.prescription_id}.pdf`);

    generatePrescriptionPDF(prescriptionData, res);
  } catch (error) {
    console.error('DownloadPrescriptionPDF error:', error);
    // If headers already sent, we can't write json error
    if (!res.headersSent) {
      return sendError(res, 'Internal server error generating PDF.');
    }
  }
};
