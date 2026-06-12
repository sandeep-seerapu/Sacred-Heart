const db = require('../config/db');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getAllDoctors = async (req, res) => {
  const { department, search } = req.query;
  try {
    let queryText = `
      SELECT u.id as user_id, u.name, u.email, d.doctor_id, d.specialization, d.experience, d.consultation_fee, d.availability_schedule, d.department_id, dep.department_name
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      WHERE 1=1`;
    const params = [];

    if (department) {
      params.push(department);
      queryText += ` AND (d.department_id = $${params.length}::integer OR dep.department_name ILIKE $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (u.name ILIKE $${params.length} OR d.specialization ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY u.name ASC`;

    const result = await db.query(queryText, params);
    return sendSuccess(res, result.rows, 'Doctors list retrieved successfully.');
  } catch (error) {
    console.error('GetAllDoctors error:', error);
    return sendError(res, 'Internal server error retrieving doctors.');
  }
};

exports.getDoctorById = async (req, res) => {
  const { id } = req.params; // doctor_id or user_id
  try {
    const queryText = `
      SELECT u.id as user_id, u.name, u.email, d.doctor_id, d.specialization, d.experience, d.consultation_fee, d.availability_schedule, d.department_id, dep.department_name
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      WHERE d.doctor_id = $1 OR u.id = $1`;
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Doctor profile not found.', 404);
    }
    return sendSuccess(res, result.rows[0], 'Doctor profile retrieved successfully.');
  } catch (error) {
    console.error('GetDoctorById error:', error);
    return sendError(res, 'Internal server error retrieving doctor.');
  }
};

exports.createDoctor = async (req, res) => {
  const { name, email, password, departmentId, specialization, experience, consultationFee, availabilitySchedule } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Hash password
    const salt = await require('bcryptjs').genSalt(10);
    const hashedPassword = await require('bcryptjs').hash(password || 'doctor123', salt);

    // Check email
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Email already exists.', 400);
    }

    const roleResult = await client.query('SELECT id FROM roles WHERE role_name = $1', ['doctor']);
    const roleId = roleResult.rows[0].id;

    // Create user
    const userResult = await client.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email.toLowerCase().trim(), hashedPassword, roleId]
    );
    const userId = userResult.rows[0].id;

    // Create doctor profile
    const defaultSchedule = {
      monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      thursday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      friday: ["09:00", "10:00", "11:00", "14:00", "15:00"]
    };

    const doctorResult = await client.query(
      `INSERT INTO doctors (user_id, department_id, specialization, experience, consultation_fee, availability_schedule)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, departmentId || null, specialization || '', experience || 0, consultationFee || 0.00, JSON.stringify(availabilitySchedule || defaultSchedule)]
    );

    await client.query('COMMIT');
    return sendSuccess(res, { user_id: userId, ...doctorResult.rows[0], name, email }, 'Doctor profile created successfully.', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CreateDoctor error:', error);
    return sendError(res, 'Internal server error creating doctor.');
  } finally {
    client.release();
  }
};

exports.updateDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  const { name, email, departmentId, specialization, experience, consultationFee, availabilitySchedule } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Get user_id associated with this doctor_id
    const doctorCheck = await client.query('SELECT user_id FROM doctors WHERE doctor_id = $1', [id]);
    if (doctorCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Doctor profile not found.', 404);
    }
    const userId = doctorCheck.rows[0].user_id;

    // Update user record
    if (name || email) {
      await client.query(
        'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3',
        [name, email ? email.toLowerCase().trim() : null, userId]
      );
    }

    // Update doctor record
    const updatedDoctor = await client.query(
      `UPDATE doctors 
       SET department_id = COALESCE($1, department_id),
           specialization = COALESCE($2, specialization),
           experience = COALESCE($3, experience),
           consultation_fee = COALESCE($4, consultation_fee),
           availability_schedule = COALESCE($5, availability_schedule)
       WHERE doctor_id = $6
       RETURNING *`,
      [
        departmentId,
        specialization,
        experience,
        consultationFee,
        availabilitySchedule ? JSON.stringify(availabilitySchedule) : null,
        id
      ]
    );

    await client.query('COMMIT');
    return sendSuccess(res, updatedDoctor.rows[0], 'Doctor profile updated successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('UpdateDoctor error:', error);
    return sendError(res, 'Internal server error updating doctor.');
  } finally {
    client.release();
  }
};

exports.deleteDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  try {
    const userCheck = await db.query('SELECT user_id FROM doctors WHERE doctor_id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return sendError(res, 'Doctor not found.', 404);
    }
    const userId = userCheck.rows[0].user_id;

    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    return sendSuccess(res, null, 'Doctor deleted successfully.');
  } catch (error) {
    console.error('DeleteDoctor error:', error);
    return sendError(res, 'Internal server error deleting doctor.');
  }
};
