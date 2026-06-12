const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'hms_super_secret_key_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper to standardise response format: { success, data, message }
const sendSuccess = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

exports.register = async (req, res) => {
  const { name, email, password, roleName, age, gender, phone, address, bloodGroup } = req.body;
  const client = await db.pool.connect();

  try {
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }

    await client.query('BEGIN');

    // Check if user already exists
    const userExists = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'A user with this email already exists.', 400);
    }

    // Get role ID
    const targetRole = roleName || 'patient';
    const roleResult = await client.query('SELECT id FROM roles WHERE role_name = $1', [targetRole]);
    if (roleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, `Invalid role: ${targetRole}`, 400);
    }
    const roleId = roleResult.rows[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUserResult = await client.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role_id',
      [name, email.toLowerCase().trim(), hashedPassword, roleId]
    );
    const newUser = newUserResult.rows[0];

    // Create profile dependent on role
    if (targetRole === 'patient') {
      await client.query(
        'INSERT INTO patients (user_id, age, gender, phone, address, blood_group) VALUES ($1, $2, $3, $4, $5, $6)',
        [newUser.id, age || null, gender || null, phone || null, address || null, bloodGroup || null]
      );
    } else if (targetRole === 'doctor') {
      // Create empty doctor profile (fields filled later or in same request)
      await client.query(
        'INSERT INTO doctors (user_id, experience, consultation_fee) VALUES ($1, $2, $3)',
        [newUser.id, 0, 0.00]
      );
    }

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role_id: newUser.role_id, role_name: targetRole },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return sendSuccess(res, { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: targetRole } }, 'Registration successful.', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    return sendError(res, 'Internal server error during registration.');
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    console.log(`[AUTH DEBUG] Login attempt for email: "${email}"`);

    // Fetch user and join role
    const userResult = await db.query(
      'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
      [email.toLowerCase().trim()]
    );

    console.log(`[AUTH DEBUG] Users found with email: ${userResult.rows.length}`);

    if (userResult.rows.length === 0) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = userResult.rows[0];
    console.log(`[AUTH DEBUG] Found user id: ${user.id}, role: ${user.role_name}`);
    console.log(`[AUTH DEBUG] DB Password Hash: "${user.password}"`);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DEBUG] bcrypt.compare result: ${isMatch}`);

    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role_id: user.role_id, role_name: user.role_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      }
    }, 'Login successful.');
  } catch (error) {
    console.error('[AUTH DEBUG] Login error:', error);
    return sendError(res, 'Internal server error during login.');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id, role_name } = req.user;

    let profileQuery = '';
    if (role_name === 'patient') {
      profileQuery = `
        SELECT u.id, u.name, u.email, u.created_at, p.patient_id, p.age, p.gender, p.phone, p.address, p.blood_group 
        FROM users u 
        LEFT JOIN patients p ON u.id = p.user_id 
        WHERE u.id = $1`;
    } else if (role_name === 'doctor') {
      profileQuery = `
        SELECT u.id, u.name, u.email, u.created_at, d.doctor_id, d.specialization, d.experience, d.consultation_fee, d.availability_schedule, dep.department_name
        FROM users u 
        LEFT JOIN doctors d ON u.id = d.user_id 
        LEFT JOIN departments dep ON d.department_id = dep.department_id
        WHERE u.id = $1`;
    } else {
      // admin
      profileQuery = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
    }

    const profileResult = await db.query(profileQuery, [id]);
    if (profileResult.rows.length === 0) {
      return sendError(res, 'User profile not found.', 404);
    }

    const profileData = profileResult.rows[0];
    profileData.role = role_name;

    return sendSuccess(res, profileData, 'Profile fetched successfully.');
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 'Internal server error during profile retrieval.');
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required.', 400);
    }

    // Get current user password
    const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Incorrect current password.', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);

    return sendSuccess(res, null, 'Password updated successfully.');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 'Internal server error during password update.');
  }
};
