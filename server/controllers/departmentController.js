const db = require('../config/db');

const sendSuccess = (res, data, message, statusCode = 200) => res.status(statusCode).json({ success: true, data, message });
const sendError = (res, message, statusCode = 500) => res.status(statusCode).json({ success: false, message });

exports.getAllDepartments = async (req, res) => {
  try {
    const queryText = `
      SELECT dep.department_id, dep.department_name, dep.description, COUNT(doc.doctor_id)::integer as doctor_count
      FROM departments dep
      LEFT JOIN doctors doc ON dep.department_id = doc.department_id
      GROUP BY dep.department_id
      ORDER BY dep.department_name ASC`;
    const result = await db.query(queryText);
    return sendSuccess(res, result.rows, 'Departments list retrieved.');
  } catch (error) {
    console.error('GetAllDepartments error:', error);
    return sendError(res, 'Internal server error retrieving departments.');
  }
};

exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const queryText = `
      SELECT dep.department_id, dep.department_name, dep.description, COUNT(doc.doctor_id)::integer as doctor_count
      FROM departments dep
      LEFT JOIN doctors doc ON dep.department_id = doc.department_id
      WHERE dep.department_id = $1
      GROUP BY dep.department_id`;
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Department not found.', 404);
    }
    return sendSuccess(res, result.rows[0], 'Department retrieved.');
  } catch (error) {
    console.error('GetDepartmentById error:', error);
    return sendError(res, 'Internal server error retrieving department.');
  }
};

exports.createDepartment = async (req, res) => {
  const { departmentName, description } = req.body;
  try {
    if (!departmentName) {
      return sendError(res, 'Department name is required.', 400);
    }

    const checkDup = await db.query('SELECT department_id FROM departments WHERE department_name ILIKE $1', [departmentName]);
    if (checkDup.rows.length > 0) {
      return sendError(res, 'Department with this name already exists.', 400);
    }

    const result = await db.query(
      'INSERT INTO departments (department_name, description) VALUES ($1, $2) RETURNING *',
      [departmentName, description || '']
    );

    return sendSuccess(res, result.rows[0], 'Department created successfully.', 201);
  } catch (error) {
    console.error('CreateDepartment error:', error);
    return sendError(res, 'Internal server error creating department.');
  }
};

exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { departmentName, description } = req.body;
  try {
    if (!departmentName) {
      return sendError(res, 'Department name is required.', 400);
    }

    const updated = await db.query(
      `UPDATE departments 
       SET department_name = $1, description = COALESCE($2, description)
       WHERE department_id = $3
       RETURNING *`,
      [departmentName, description, id]
    );

    if (updated.rows.length === 0) {
      return sendError(res, 'Department not found.', 404);
    }

    return sendSuccess(res, updated.rows[0], 'Department updated successfully.');
  } catch (error) {
    console.error('UpdateDepartment error:', error);
    return sendError(res, 'Internal server error updating department.');
  }
};

exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM departments WHERE department_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Department not found.', 404);
    }
    return sendSuccess(res, null, 'Department deleted successfully.');
  } catch (error) {
    console.error('DeleteDepartment error:', error);
    return sendError(res, 'Internal server error deleting department.');
  }
};
