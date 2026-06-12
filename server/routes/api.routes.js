const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Controllers
const auth = require('../controllers/authController');
const patients = require('../controllers/patientController');
const doctors = require('../controllers/doctorController');
const appointments = require('../controllers/appointmentController');
const records = require('../controllers/recordController');
const prescriptions = require('../controllers/prescriptionController');
const departments = require('../controllers/departmentController');
const analytics = require('../controllers/analyticsController');

// ==========================================
// 1. AUTH ROUTES
// ==========================================
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/profile', authMiddleware, auth.getProfile);
router.put('/auth/change-password', authMiddleware, auth.changePassword);

// ==========================================
// 2. PATIENT ROUTES
// ==========================================
router.get('/patients', authMiddleware, roleMiddleware(['admin', 'doctor']), patients.getAllPatients);
router.get('/patients/:id', authMiddleware, roleMiddleware(['admin', 'doctor', 'patient']), patients.getPatientById);
router.post('/patients', authMiddleware, roleMiddleware(['admin']), patients.createPatient);
router.put('/patients/:id', authMiddleware, roleMiddleware(['admin', 'patient']), patients.updatePatient);
router.delete('/patients/:id', authMiddleware, roleMiddleware(['admin']), patients.deletePatient);

// ==========================================
// 3. DOCTOR ROUTES
// ==========================================
router.get('/doctors', doctors.getAllDoctors); // Public to search doctors
router.get('/doctors/:id', doctors.getDoctorById);
router.post('/doctors', authMiddleware, roleMiddleware(['admin']), doctors.createDoctor);
router.put('/doctors/:id', authMiddleware, roleMiddleware(['admin', 'doctor']), doctors.updateDoctor);
router.delete('/doctors/:id', authMiddleware, roleMiddleware(['admin']), doctors.deleteDoctor);

// ==========================================
// 4. APPOINTMENT ROUTES
// ==========================================
router.get('/appointments', authMiddleware, appointments.getAllAppointments);
router.get('/appointments/:id', authMiddleware, appointments.getAppointmentById);
router.post('/appointments', authMiddleware, appointments.bookAppointment);
router.put('/appointments/:id', authMiddleware, appointments.updateAppointmentStatus);
router.delete('/appointments/:id', authMiddleware, roleMiddleware(['admin']), appointments.deleteAppointment);

// ==========================================
// 5. MEDICAL RECORD ROUTES
// ==========================================
router.get('/records', authMiddleware, records.getAllRecords);
router.get('/records/:id', authMiddleware, records.getRecordById);
router.post('/records', authMiddleware, roleMiddleware(['doctor']), records.createRecord);
router.put('/records/:id', authMiddleware, roleMiddleware(['doctor', 'admin']), records.updateRecord);
router.delete('/records/:id', authMiddleware, roleMiddleware(['admin', 'doctor']), records.deleteRecord);

// ==========================================
// 6. PRESCRIPTION ROUTES
// ==========================================
router.get('/prescriptions/:record_id', authMiddleware, prescriptions.getPrescriptionByRecordId);
router.post('/prescriptions', authMiddleware, roleMiddleware(['doctor']), prescriptions.createPrescription);
router.put('/prescriptions/:id', authMiddleware, roleMiddleware(['doctor']), prescriptions.updatePrescription);
router.delete('/prescriptions/:id', authMiddleware, roleMiddleware(['doctor', 'admin']), prescriptions.deletePrescription);
router.get('/prescriptions/:id/download', prescriptions.downloadPrescriptionPDF); // public/jwt depending on implementation. Usually downloadable with query or id

// ==========================================
// 7. DEPARTMENT ROUTES
// ==========================================
router.get('/departments', departments.getAllDepartments); // Public to fetch departments
router.get('/departments/:id', departments.getDepartmentById);
router.post('/departments', authMiddleware, roleMiddleware(['admin']), departments.createDepartment);
router.put('/departments/:id', authMiddleware, roleMiddleware(['admin']), departments.updateDepartment);
router.delete('/departments/:id', authMiddleware, roleMiddleware(['admin']), departments.deleteDepartment);

// ==========================================
// 8. ANALYTICS ROUTES (Admin only)
// ==========================================
router.get('/analytics/overview', authMiddleware, roleMiddleware(['admin']), analytics.getOverview);
router.get('/analytics/appointments-by-status', authMiddleware, roleMiddleware(['admin']), analytics.getAppointmentsByStatus);
router.get('/analytics/appointments-by-department', authMiddleware, roleMiddleware(['admin']), analytics.getAppointmentsByDepartment);
router.get('/analytics/monthly-stats', authMiddleware, roleMiddleware(['admin']), analytics.getMonthlyStats);

module.exports = router;
