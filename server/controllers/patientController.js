const db = require('../config/db');

// Helper to standardise responses
const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getAllPatients = async (req, res) => {
  try {
    const queryText = `
      SELECT u.id as user_id, u.name, u.email, p.patient_id, p.age, p.gender, p.phone, p.address, p.blood_group, u.created_at
      FROM users u
      JOIN patients p ON u.id = p.user_id
      ORDER BY u.name ASC`;
    const result = await db.query(queryText);
    return sendSuccess(res, result.rows, 'All patients retrieved successfully.');
  } catch (error) {
    console.error('GetAllPatients error:', error);
    return sendError(res, 'Internal server error retrieving patients.');
  }
};

exports.getPatientById = async (req, res) => {
  const { id } = req.params; // user_id or patient_id? Let's check based on query. Usually patients table key is patient_id.
  try {
    const queryText = `
      SELECT u.id as user_id, u.name, u.email, p.patient_id, p.age, p.gender, p.phone, p.address, p.blood_group, u.created_at
      FROM users u
      JOIN patients p ON u.id = p.user_id
      WHERE p.patient_id = $1 OR u.id = $1`;
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Patient not found.', 404);
    }
    return sendSuccess(res, result.rows[0], 'Patient profile retrieved successfully.');
  } catch (error) {
    console.error('GetPatientById error:', error);
    return sendError(res, 'Internal server error retrieving patient.');
  }
};

exports.createPatient = async (req, res) => {
  const { name, email, password, age, gender, phone, address, bloodGroup } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Hash password
    const salt = await require('bcryptjs').genSalt(10);
    const hashedPassword = await require('bcryptjs').hash(password || 'patient123', salt);
    
    // Check email
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Email already exists.', 400);
    }

    const roleResult = await client.query('SELECT id FROM roles WHERE role_name = $1', ['patient']);
    const roleId = roleResult.rows[0].id;

    const userResult = await client.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email.toLowerCase().trim(), hashedPassword, roleId]
    );
    const userId = userResult.rows[0].id;

    const patientResult = await client.query(
      'INSERT INTO patients (user_id, age, gender, phone, address, blood_group) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, age, gender, phone, address, bloodGroup]
    );

    await client.query('COMMIT');
    return sendSuccess(res, { user_id: userId, ...patientResult.rows[0], name, email }, 'Patient profile created successfully.', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CreatePatient error:', error);
    return sendError(res, 'Internal server error creating patient.');
  } finally {
    client.release();
  }
};

exports.updatePatient = async (req, res) => {
  const { id } = req.params; // patient_id
  const { name, email, age, gender, phone, address, bloodGroup } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Get user_id associated with this patient_id
    const patientCheck = await client.query('SELECT user_id FROM patients WHERE patient_id = $1', [id]);
    if (patientCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Patient profile not found.', 404);
    }
    const userId = patientCheck.rows[0].user_id;

    // Update user record
    if (name || email) {
      await client.query(
        'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3',
        [name, email ? email.toLowerCase().trim() : null, userId]
      );
    }

    // Update patient record
    const updatedPatient = await client.query(
      `UPDATE patients 
       SET age = COALESCE($1, age), gender = COALESCE($2, gender), phone = COALESCE($3, phone), address = COALESCE($4, address), blood_group = COALESCE($5, blood_group)
       WHERE patient_id = $6
       RETURNING *`,
      [age, gender, phone, address, bloodGroup, id]
    );

    await client.query('COMMIT');
    return sendSuccess(res, updatedPatient.rows[0], 'Patient profile updated successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('UpdatePatient error:', error);
    return sendError(res, 'Internal server error updating patient.');
  } finally {
    client.release();
  }
};

exports.deletePatient = async (req, res) => {
  const { id } = req.params; // patient_id
  try {
    // Delete patient will trigger delete user because of ON DELETE CASCADE on user_id? No, CASCADE is on patients user_id REFERENCES users(id).
    // So deleting user deletes patient. Let's delete the user.
    const userCheck = await db.query('SELECT user_id FROM patients WHERE patient_id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return sendError(res, 'Patient not found.', 404);
    }
    const userId = userCheck.rows[0].user_id;

    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    return sendSuccess(res, null, 'Patient deleted successfully.');
  } catch (error) {
    console.error('DeletePatient error:', error);
    return sendError(res, 'Internal server error deleting patient.');
  }
};
