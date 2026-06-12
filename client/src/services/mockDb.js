// LocalStorage Mock Database for HMS Standalone Mode

const KEYS = {
  ROLES: 'hms_mock_roles',
  USERS: 'hms_mock_users',
  PATIENTS: 'hms_mock_patients',
  DOCTORS: 'hms_mock_doctors',
  DEPARTMENTS: 'hms_mock_departments',
  APPOINTMENTS: 'hms_mock_appointments',
  RECORDS: 'hms_mock_records',
  PRESCRIPTIONS: 'hms_mock_prescriptions',
  NOTIFICATIONS: 'hms_mock_notifications'
};

// Seeding Initial Data
const initialRoles = [
  { id: 1, role_name: 'patient' },
  { id: 2, role_name: 'doctor' },
  { id: 3, role_name: 'admin' }
];

const initialDepartments = [
  { department_id: 1, department_name: 'Cardiology', description: 'Expert heart care and diagnostics for cardiovascular conditions.' },
  { department_id: 2, department_name: 'Neurology', description: 'Diagnosis and treatment of brain, spinal cord, and nerve disorders.' },
  { department_id: 3, department_name: 'Orthopedics', description: 'Surgical and non-surgical treatment for bone, joint, and muscle conditions.' },
  { department_id: 4, department_name: 'Pediatrics', description: 'Comprehensive healthcare services for infants, children, and adolescents.' },
  { department_id: 5, department_name: 'Dermatology', description: 'Specialized medical and cosmetic care for skin, hair, and nail health.' }
];

const initialUsers = [
  { id: 1, name: 'Suresh Babu', email: 'admin@hospital.com', password: 'admin123', role_id: 3, created_at: new Date().toISOString() },
  { id: 2, name: 'Dr. Priya Sharma', email: 'doctor@hospital.com', password: 'doctor123', role_id: 2, created_at: new Date().toISOString() },
  { id: 3, name: 'Dr. Arjun Mehta', email: 'house@hospital.com', password: 'doctor123', role_id: 2, created_at: new Date().toISOString() },
  { id: 4, name: 'Rahul Verma', email: 'patient@hospital.com', password: 'patient123', role_id: 1, created_at: new Date().toISOString() }
];

const initialDoctors = [
  {
    doctor_id: 1,
    user_id: 2,
    department_id: 1,
    specialization: 'Interventional Cardiology',
    experience: 12,
    consultation_fee: 150.00,
    availability_schedule: {
      monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      wednesday: ["09:00", "10:00", "11:00"],
      friday: ["14:00", "15:00", "16:00"]
    }
  },
  {
    doctor_id: 2,
    user_id: 3,
    department_id: 2,
    specialization: 'Diagnostic Neurology',
    experience: 20,
    consultation_fee: 250.00,
    availability_schedule: {
      tuesday: ["10:00", "11:00", "12:00", "15:00", "16:00"],
      thursday: ["10:00", "11:00", "12:00"]
    }
  }
];

const initialPatients = [
  { patient_id: 1, user_id: 4, age: 32, gender: 'Male', phone: '+91-98765-43210', address: '45 MG Road, Bengaluru, Karnataka', blood_group: 'B+' }
];

const initialAppointments = [
  { appointment_id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-06-15', appointment_time: '10:00', status: 'Confirmed', notes: 'Routine cardiac checkup.', created_at: new Date().toISOString() },
  { appointment_id: 2, patient_id: 1, doctor_id: 2, appointment_date: '2026-06-20', appointment_time: '11:00', status: 'Pending', notes: 'Frequent headaches.', created_at: new Date().toISOString() }
];

const initialRecords = [
  { record_id: 1, patient_id: 1, doctor_id: 1, diagnosis: 'Mild Hypertension', treatment: 'Prescribed daily exercise & low-sodium diet.', visit_date: '2026-05-10', notes: 'Patient shows stable heart rhythm.' }
];

const initialPrescriptions = [
  { prescription_id: 1, record_id: 1, medicines: 'Lisinopril 10mg', dosage: '1 tablet daily', duration: '30 days', instructions: 'Take in the morning with water.' }
];

const initialNotifications = [
  { id: 1, user_id: 4, message: 'Your appointment request with Dr. Priya Sharma has been confirmed.', is_read: false, created_at: new Date().toISOString() },
  { id: 2, user_id: 2, message: 'New appointment request from Rahul Verma.', is_read: true, created_at: new Date().toISOString() }
];

// Database Initialization Helper
const initDB = () => {
  if (!localStorage.getItem(KEYS.ROLES)) localStorage.setItem(KEYS.ROLES, JSON.stringify(initialRoles));
  if (!localStorage.getItem(KEYS.DEPARTMENTS)) localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  if (!localStorage.getItem(KEYS.DOCTORS)) localStorage.setItem(KEYS.DOCTORS, JSON.stringify(initialDoctors));
  if (!localStorage.getItem(KEYS.PATIENTS)) localStorage.setItem(KEYS.PATIENTS, JSON.stringify(initialPatients));
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
  if (!localStorage.getItem(KEYS.RECORDS)) localStorage.setItem(KEYS.RECORDS, JSON.stringify(initialRecords));
  if (!localStorage.getItem(KEYS.PRESCRIPTIONS)) localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(initialPrescriptions));
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
};

initDB();

// DB Access Methods
const getItem = (key) => JSON.parse(localStorage.getItem(key));
const setItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const mockDb = {
  // Auth Operations
  register: (name, email, password, roleName = 'patient', extraData = {}) => {
    const users = getItem(KEYS.USERS);
    const roles = getItem(KEYS.ROLES);
    
    const exist = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exist) throw new Error('A user with this email already exists.');

    const targetRole = roles.find(r => r.role_name === roleName);
    if (!targetRole) throw new Error(`Role '${roleName}' is invalid.`);

    const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newUserId,
      name,
      email: email.toLowerCase(),
      password, // clear text mock auth
      role_id: targetRole.id,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setItem(KEYS.USERS, users);

    if (roleName === 'patient') {
      const patients = getItem(KEYS.PATIENTS);
      const newPatientId = patients.length > 0 ? Math.max(...patients.map(p => p.patient_id)) + 1 : 1;
      const newPatient = {
        patient_id: newPatientId,
        user_id: newUserId,
        age: extraData.age || null,
        gender: extraData.gender || null,
        phone: extraData.phone || null,
        address: extraData.address || null,
        blood_group: extraData.bloodGroup || null
      };
      patients.push(newPatient);
      setItem(KEYS.PATIENTS, patients);
    } else if (roleName === 'doctor') {
      const doctors = getItem(KEYS.DOCTORS);
      const newDoctorId = doctors.length > 0 ? Math.max(...doctors.map(d => d.doctor_id)) + 1 : 1;
      const newDoctor = {
        doctor_id: newDoctorId,
        user_id: newUserId,
        department_id: extraData.departmentId || 1,
        specialization: extraData.specialization || 'General',
        experience: extraData.experience || 1,
        consultation_fee: extraData.consultationFee || 50.00,
        availability_schedule: extraData.availabilitySchedule || {
          monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
          tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
          wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
          thursday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
          friday: ["09:00", "10:00", "11:00", "14:00", "15:00"]
        }
      };
      doctors.push(newDoctor);
      setItem(KEYS.DOCTORS, doctors);
    }

    return {
      token: `mock_jwt_token_user_${newUserId}`,
      user: { id: newUserId, name, email: email.toLowerCase(), role: roleName }
    };
  },

  login: (email, password) => {
    const users = getItem(KEYS.USERS);
    const roles = getItem(KEYS.ROLES);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.');
    }

    const role = roles.find(r => r.id === user.role_id);
    return {
      token: `mock_jwt_token_user_${user.id}`,
      user: { id: user.id, name: user.name, email: user.email, role: role.role_name }
    };
  },

  getProfile: (userId) => {
    const users = getItem(KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const roles = getItem(KEYS.ROLES);
    const role = roles.find(r => r.id === user.role_id);

    const base = { id: user.id, name: user.name, email: user.email, role: role.role_name, created_at: user.created_at };

    if (role.role_name === 'patient') {
      const patients = getItem(KEYS.PATIENTS);
      const patient = patients.find(p => p.user_id === userId) || {};
      return { ...base, ...patient };
    } else if (role.role_name === 'doctor') {
      const doctors = getItem(KEYS.DOCTORS);
      const doctor = doctors.find(d => d.user_id === userId) || {};
      const depts = getItem(KEYS.DEPARTMENTS);
      const dept = depts.find(dp => dp.department_id === doctor.department_id) || {};
      return { ...base, ...doctor, department_name: dept.department_name };
    }
    return base;
  },

  changePassword: (userId, currentPass, newPass) => {
    const users = getItem(KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found.');
    if (users[index].password !== currentPass) throw new Error('Incorrect current password.');
    users[index].password = newPass;
    setItem(KEYS.USERS, users);
    return true;
  },

  // Patients Listing
  getPatients: () => {
    const users = getItem(KEYS.USERS);
    const patients = getItem(KEYS.PATIENTS);
    return patients.map(p => {
      const u = users.find(usr => usr.id === p.user_id) || {};
      return {
        user_id: p.user_id,
        patient_id: p.patient_id,
        name: u.name,
        email: u.email,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        address: p.address,
        blood_group: p.blood_group,
        created_at: u.created_at
      };
    });
  },

  // Doctors Search
  getDoctors: (departmentId, search) => {
    const users = getItem(KEYS.USERS);
    const doctors = getItem(KEYS.DOCTORS);
    const depts = getItem(KEYS.DEPARTMENTS);

    let list = doctors.map(d => {
      const u = users.find(usr => usr.id === d.user_id) || {};
      const dp = depts.find(dept => dept.department_id === d.department_id) || {};
      return {
        user_id: d.user_id,
        doctor_id: d.doctor_id,
        name: u.name,
        email: u.email,
        specialization: d.specialization,
        experience: d.experience,
        consultation_fee: d.consultation_fee,
        availability_schedule: d.availability_schedule,
        department_id: d.department_id,
        department_name: dp.department_name
      };
    });

    if (departmentId) {
      list = list.filter(d => d.department_id === parseInt(departmentId));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q));
    }
    return list;
  },

  // Appointments
  getAppointments: (roleName, userId) => {
    const appts = getItem(KEYS.APPOINTMENTS);
    const patients = getItem(KEYS.PATIENTS);
    const doctors = getItem(KEYS.DOCTORS);
    const users = getItem(KEYS.USERS);
    const depts = getItem(KEYS.DEPARTMENTS);

    const detailedList = appts.map(a => {
      const p = patients.find(pat => pat.patient_id === a.patient_id) || {};
      const d = doctors.find(doc => doc.doctor_id === a.doctor_id) || {};
      
      const patUser = users.find(u => u.id === p.user_id) || {};
      const docUser = users.find(u => u.id === d.user_id) || {};
      const dp = depts.find(dept => dept.department_id === d.department_id) || {};

      return {
        appointment_id: a.appointment_id,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        status: a.status,
        notes: a.notes,
        created_at: a.created_at,
        patient_id: a.patient_id,
        patient_name: patUser.name,
        patient_email: patUser.email,
        patient_phone: p.phone,
        doctor_id: a.doctor_id,
        doctor_name: docUser.name,
        doctor_email: docUser.email,
        specialization: d.specialization,
        department_name: dp.department_name,
        patient_user_id: patUser.id,
        doctor_user_id: docUser.id
      };
    });

    if (roleName === 'patient') {
      return detailedList.filter(a => a.patient_user_id === userId);
    } else if (roleName === 'doctor') {
      return detailedList.filter(a => a.doctor_user_id === userId);
    }
    return detailedList; // admin
  },

  bookAppointment: (doctorId, date, time, notes, user) => {
    const appts = getItem(KEYS.APPOINTMENTS);
    const patients = getItem(KEYS.PATIENTS);
    
    let patientId;
    if (user.role === 'patient') {
      const p = patients.find(pat => pat.user_id === user.id);
      if (!p) throw new Error('Patient profile not found.');
      patientId = p.patient_id;
    } else {
      throw new Error('Only patients can book appointments.');
    }

    // Collision Check
    const collision = appts.find(a => a.doctor_id === parseInt(doctorId) && a.appointment_date === date && a.appointment_time === time && a.status !== 'Cancelled');
    if (collision) throw new Error('This time slot is already booked for this doctor.');

    const newId = appts.length > 0 ? Math.max(...appts.map(a => a.appointment_id)) + 1 : 1;
    const newAppt = {
      appointment_id: newId,
      patient_id: patientId,
      doctor_id: parseInt(doctorId),
      appointment_date: date,
      appointment_time: time,
      status: 'Pending',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    appts.push(newAppt);
    setItem(KEYS.APPOINTMENTS, appts);

    // Notify Doctor
    const doctors = getItem(KEYS.DOCTORS);
    const targetDoc = doctors.find(d => d.doctor_id === parseInt(doctorId));
    if (targetDoc) {
      const notifs = getItem(KEYS.NOTIFICATIONS);
      const newNotifId = notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) + 1 : 1;
      notifs.push({
        id: newNotifId,
        user_id: targetDoc.user_id,
        message: `New appointment requested by ${user.name} on ${date} at ${time}.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      setItem(KEYS.NOTIFICATIONS, notifs);
    }

    return newAppt;
  },

  updateAppointmentStatus: (appointmentId, status, user) => {
    const appts = getItem(KEYS.APPOINTMENTS);
    const index = appts.findIndex(a => a.appointment_id === parseInt(appointmentId));
    if (index === -1) throw new Error('Appointment not found.');

    appts[index].status = status;
    setItem(KEYS.APPOINTMENTS, appts);

    // Notify Parties
    const appt = appts[index];
    const patients = getItem(KEYS.PATIENTS);
    const doctors = getItem(KEYS.DOCTORS);
    const notifs = getItem(KEYS.NOTIFICATIONS);
    const newNotifId = notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) + 1 : 1;

    if (user.role === 'doctor' || user.role === 'admin') {
      // Notify Patient
      const pat = patients.find(p => p.patient_id === appt.patient_id);
      if (pat) {
        notifs.push({
          id: newNotifId,
          user_id: pat.user_id,
          message: `Your appointment request on ${appt.appointment_date} has been ${status.toLowerCase()}.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    } else if (user.role === 'patient' && status === 'Cancelled') {
      // Notify Doctor
      const doc = doctors.find(d => d.doctor_id === appt.doctor_id);
      if (doc) {
        notifs.push({
          id: newNotifId,
          user_id: doc.user_id,
          message: `Appointment scheduled for ${appt.appointment_date} was cancelled by the patient.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    }
    setItem(KEYS.NOTIFICATIONS, notifs);
    return appts[index];
  },

  // EMR Medical Records
  getRecords: (roleName, userId) => {
    const records = getItem(KEYS.RECORDS);
    const pre = getItem(KEYS.PRESCRIPTIONS);
    const patients = getItem(KEYS.PATIENTS);
    const doctors = getItem(KEYS.DOCTORS);
    const users = getItem(KEYS.USERS);

    const detailed = records.map(r => {
      const p = patients.find(pat => pat.patient_id === r.patient_id) || {};
      const d = doctors.find(doc => doc.doctor_id === r.doctor_id) || {};
      const patUser = users.find(u => u.id === p.user_id) || {};
      const docUser = users.find(u => u.id === d.user_id) || {};
      const rx = pre.find(pr => pr.record_id === r.record_id) || {};

      return {
        record_id: r.record_id,
        diagnosis: r.diagnosis,
        treatment: r.treatment,
        visit_date: r.visit_date,
        notes: r.notes,
        patient_id: r.patient_id,
        patient_name: patUser.name,
        patient_email: patUser.email,
        patient_user_id: p.user_id,
        age: p.age,
        gender: p.gender,
        blood_group: p.blood_group,
        doctor_id: r.doctor_id,
        doctor_name: docUser.name,
        doctor_user_id: d.user_id,
        prescription_id: rx.prescription_id || null,
        medicines: rx.medicines || '',
        dosage: rx.dosage || '',
        duration: rx.duration || '',
        instructions: rx.instructions || ''
      };
    });

    if (roleName === 'patient') {
      return detailed.filter(r => r.patient_user_id === userId);
    } else if (roleName === 'doctor') {
      return detailed.filter(r => r.doctor_user_id === userId);
    }
    return detailed;
  },

  createRecord: (patientId, diagnosis, treatment, visitDate, notes, medicines, dosage, duration, instructions, doctorUserId) => {
    const records = getItem(KEYS.RECORDS);
    const doctors = getItem(KEYS.DOCTORS);

    const doc = doctors.find(d => d.user_id === doctorUserId);
    if (!doc) throw new Error('Doctor profile not found.');

    const newRecId = records.length > 0 ? Math.max(...records.map(r => r.record_id)) + 1 : 1;
    const newRecord = {
      record_id: newRecId,
      patient_id: parseInt(patientId),
      doctor_id: doc.doctor_id,
      diagnosis,
      treatment: treatment || '',
      visit_date: visitDate || new Date().toISOString().split('T')[0],
      notes: notes || ''
    };

    records.push(newRecord);
    setItem(KEYS.RECORDS, records);

    let newRx = null;
    if (medicines) {
      const rx = getItem(KEYS.PRESCRIPTIONS);
      const newRxId = rx.length > 0 ? Math.max(...rx.map(p => p.prescription_id)) + 1 : 1;
      newRx = {
        prescription_id: newRxId,
        record_id: newRecId,
        medicines,
        dosage: dosage || '',
        duration: duration || '',
        instructions: instructions || ''
      };
      rx.push(newRx);
      setItem(KEYS.PRESCRIPTIONS, rx);
    }

    return { ...newRecord, prescription: newRx };
  },

  // Admin CRUD for Departments
  getDepartments: () => getItem(KEYS.DEPARTMENTS),

  createDepartment: (name, description) => {
    const depts = getItem(KEYS.DEPARTMENTS);
    const check = depts.find(d => d.department_name.toLowerCase() === name.toLowerCase());
    if (check) throw new Error('Department name already exists.');

    const newId = depts.length > 0 ? Math.max(...depts.map(d => d.department_id)) + 1 : 1;
    const newDept = { department_id: newId, department_name: name, description: description || '' };
    depts.push(newDept);
    setItem(KEYS.DEPARTMENTS, depts);
    return newDept;
  },

  updateDepartment: (id, name, description) => {
    const depts = getItem(KEYS.DEPARTMENTS);
    const idx = depts.findIndex(d => d.department_id === parseInt(id));
    if (idx === -1) throw new Error('Department not found.');
    depts[idx].department_name = name;
    depts[idx].description = description || '';
    setItem(KEYS.DEPARTMENTS, depts);
    return depts[idx];
  },

  deleteDepartment: (id) => {
    const depts = getItem(KEYS.DEPARTMENTS);
    const filtered = depts.filter(d => d.department_id !== parseInt(id));
    setItem(KEYS.DEPARTMENTS, filtered);
    return true;
  },

  // Admin CRUD for Doctors
  createDoctorAdmin: (name, email, password, deptId, specialization, experience, fee) => {
    return mockDb.register(name, email, password, 'doctor', {
      departmentId: parseInt(deptId),
      specialization,
      experience: parseInt(experience),
      consultationFee: parseFloat(fee)
    });
  },

  updateDoctorAdmin: (doctorId, name, email, deptId, specialization, experience, fee) => {
    const doctors = getItem(KEYS.DOCTORS);
    const users = getItem(KEYS.USERS);

    const docIndex = doctors.findIndex(d => d.doctor_id === parseInt(doctorId));
    if (docIndex === -1) throw new Error('Doctor profile not found.');

    const doc = doctors[docIndex];
    const userIndex = users.findIndex(u => u.id === doc.user_id);
    if (userIndex === -1) throw new Error('Doctor user account not found.');

    // Update User
    users[userIndex].name = name;
    users[userIndex].email = email.toLowerCase();
    setItem(KEYS.USERS, users);

    // Update Doctor
    doctors[docIndex].department_id = parseInt(deptId);
    doctors[docIndex].specialization = specialization;
    doctors[docIndex].experience = parseInt(experience);
    doctors[docIndex].consultation_fee = parseFloat(fee);
    setItem(KEYS.DOCTORS, doctors);

    return { doctor_id: doctorId, name, email };
  },

  deleteDoctorAdmin: (doctorId) => {
    const doctors = getItem(KEYS.DOCTORS);
    const users = getItem(KEYS.USERS);
    const doc = doctors.find(d => d.doctor_id === parseInt(doctorId));
    if (!doc) throw new Error('Doctor not found.');

    const filteredDocs = doctors.filter(d => d.doctor_id !== parseInt(doctorId));
    const filteredUsers = users.filter(u => u.id !== doc.user_id);
    setItem(KEYS.DOCTORS, filteredDocs);
    setItem(KEYS.USERS, filteredUsers);
    return true;
  },

  // Admin CRUD for Patients
  updatePatientAdmin: (patientId, name, email, age, gender, phone, address, bloodGroup) => {
    const patients = getItem(KEYS.PATIENTS);
    const users = getItem(KEYS.USERS);

    const patIdx = patients.findIndex(p => p.patient_id === parseInt(patientId));
    if (patIdx === -1) throw new Error('Patient not found.');

    const pat = patients[patIdx];
    const usrIdx = users.findIndex(u => u.id === pat.user_id);

    if (usrIdx !== -1) {
      users[usrIdx].name = name;
      users[usrIdx].email = email.toLowerCase();
      setItem(KEYS.USERS, users);
    }

    patients[patIdx].age = parseInt(age);
    patients[patIdx].gender = gender;
    patients[patIdx].phone = phone;
    patients[patIdx].address = address;
    patients[patIdx].blood_group = bloodGroup;
    setItem(KEYS.PATIENTS, patients);

    return patients[patIdx];
  },

  deletePatientAdmin: (patientId) => {
    const patients = getItem(KEYS.PATIENTS);
    const users = getItem(KEYS.USERS);
    const pat = patients.find(p => p.patient_id === parseInt(patientId));
    if (!pat) throw new Error('Patient not found.');

    const filteredPats = patients.filter(p => p.patient_id !== parseInt(patientId));
    const filteredUsers = users.filter(u => u.id !== pat.user_id);
    setItem(KEYS.PATIENTS, filteredPats);
    setItem(KEYS.USERS, filteredUsers);
    return true;
  },

  // Admin Reports / Charts
  getAnalyticsOverview: () => {
    const patients = getItem(KEYS.PATIENTS);
    const doctors = getItem(KEYS.DOCTORS);
    const appts = getItem(KEYS.APPOINTMENTS);

    // Sum fee of Completed appointments
    const completed = appts.filter(a => a.status === 'Completed');
    let revenue = 0;
    completed.forEach(c => {
      const doc = doctors.find(d => d.doctor_id === c.doctor_id) || { consultation_fee: 50 };
      revenue += parseFloat(doc.consultation_fee);
    });

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalAppointments: appts.length,
      revenue
    };
  },

  getAppointmentsByStatus: () => {
    const appts = getItem(KEYS.APPOINTMENTS);
    const statuses = {};
    appts.forEach(a => {
      statuses[a.status] = (statuses[a.status] || 0) + 1;
    });
    return Object.keys(statuses).map(k => ({ status: k, count: statuses[k] }));
  },

  getAppointmentsByDepartment: () => {
    const appts = getItem(KEYS.APPOINTMENTS);
    const doctors = getItem(KEYS.DOCTORS);
    const depts = getItem(KEYS.DEPARTMENTS);

    const counts = {};
    appts.forEach(a => {
      const doc = doctors.find(d => d.doctor_id === a.doctor_id);
      if (doc) {
        const dept = depts.find(dp => dp.department_id === doc.department_id);
        if (dept) {
          counts[dept.department_name] = (counts[dept.department_name] || 0) + 1;
        }
      }
    });

    return Object.keys(counts).map(k => ({ department_name: k, count: counts[k] }));
  },

  getMonthlyStats: () => {
    // Generate static mockup months or parse dates
    const appts = getItem(KEYS.APPOINTMENTS);
    const months = {};
    appts.forEach(a => {
      const m = a.appointment_date.substring(0, 7); // YYYY-MM
      months[m] = (months[m] || 0) + 1;
    });

    // Make sure we have at least standard test months
    const keys = Object.keys(months).sort();
    if (keys.length === 0) {
      return [
        { month: '2026-04', count: 12 },
        { month: '2026-05', count: 24 },
        { month: '2026-06', count: 32 }
      ];
    }

    return keys.map(k => ({ month: k, count: months[k] }));
  },

  // Notifications
  getNotifications: (userId) => {
    const notifs = getItem(KEYS.NOTIFICATIONS);
    return notifs.filter(n => n.user_id === userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },

  markNotificationsRead: (userId) => {
    const notifs = getItem(KEYS.NOTIFICATIONS);
    notifs.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    setItem(KEYS.NOTIFICATIONS, notifs);
    return true;
  }
};
