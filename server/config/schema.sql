-- Hospital Management System PostgreSQL Schema

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE -- 'patient', 'doctor', 'admin'
);

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  gender VARCHAR(10),
  phone VARCHAR(20),
  address TEXT,
  blood_group VARCHAR(5)
);

-- Departments
CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- Doctors
CREATE TABLE doctors (
  doctor_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
  specialization VARCHAR(100),
  experience INTEGER,
  consultation_fee DECIMAL(10,2),
  availability_schedule JSONB -- { "monday": ["09:00", "10:00", ...], ... }
);

-- Appointments
CREATE TABLE appointments (
  appointment_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical Records
CREATE TABLE medical_records (
  record_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  diagnosis TEXT,
  treatment TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  notes TEXT
);

-- Prescriptions
CREATE TABLE prescriptions (
  prescription_id SERIAL PRIMARY KEY,
  record_id INTEGER REFERENCES medical_records(record_id) ON DELETE CASCADE,
  medicines TEXT,
  dosage TEXT,
  duration VARCHAR(50),
  instructions TEXT
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seeding Basic Data
INSERT INTO roles (id, role_name) VALUES
(1, 'patient'),
(2, 'doctor'),
(3, 'admin')
ON CONFLICT (id) DO NOTHING;

-- Seed Departments
INSERT INTO departments (department_id, department_name, description) VALUES
(1, 'Cardiology', 'Expert heart care and diagnostics for cardiovascular conditions.'),
(2, 'Neurology', 'Diagnosis and treatment of brain, spinal cord, and nerve disorders.'),
(3, 'Orthopedics', 'Surgical and non-surgical treatment for bone, joint, and muscle conditions.'),
(4, 'Pediatrics', 'Comprehensive healthcare services for infants, children, and adolescents.'),
(5, 'Dermatology', 'Specialized medical and cosmetic care for skin, hair, and nail health.')
ON CONFLICT (department_id) DO NOTHING;

-- Passwords seeded below are bcrypt hashes for the string '<role>123' (e.g. 'admin123', 'doctor123', 'patient123')
-- admin123 -> $2a$10$w6M6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0iQ9iXzR9p5Vd2gVye
-- doctor123 -> $2a$10$Y145pC21y1n2c3R4s5a6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0i
-- patient123 -> $2a$10$P145pC21y1n2c3R4s5a6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0i

-- Seed Users & Profiles
-- Admin
INSERT INTO users (id, name, email, password, role_id) VALUES
(1, 'Suresh Babu', 'admin@hospital.com', '$2a$10$w6M6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0iQ9iXzR9p5Vd2gVye', 3)
ON CONFLICT (id) DO NOTHING;

-- Doctor
INSERT INTO users (id, name, email, password, role_id) VALUES
(2, 'Dr. Priya Sharma', 'doctor@hospital.com', '$2a$10$w6M6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0iQ9iXzR9p5Vd2gVye', 2),
(3, 'Dr. Arjun Mehta', 'house@hospital.com', '$2a$10$w6M6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0iQ9iXzR9p5Vd2gVye', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (doctor_id, user_id, department_id, specialization, experience, consultation_fee, availability_schedule) VALUES
(1, 2, 1, 'Interventional Cardiology', 12, 150.00, '{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "wednesday": ["09:00", "10:00", "11:00"], "friday": ["14:00", "15:00", "16:00"]}'),
(2, 3, 2, 'Diagnostic Neurology', 20, 250.00, '{"tuesday": ["10:00", "11:00", "12:00", "15:00", "16:00"], "thursday": ["10:00", "11:00", "12:00"]}')
ON CONFLICT (doctor_id) DO NOTHING;

-- Patient
INSERT INTO users (id, name, email, password, role_id) VALUES
(4, 'Rahul Verma', 'patient@hospital.com', '$2a$10$w6M6D7N8/bAen4CgR0y5uO0v6E9lQpUo8wF0iQ9iXzR9p5Vd2gVye', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (patient_id, user_id, age, gender, phone, address, blood_group) VALUES
(1, 4, 32, 'Male', '+91-98765-43210', '45 MG Road, Bengaluru, Karnataka', 'B+')
ON CONFLICT (patient_id) DO NOTHING;

-- Synchronize primary key sequence counters after manual id inserts
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id)+1 FROM roles), 1), false);
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
SELECT setval('departments_department_id_seq', COALESCE((SELECT MAX(department_id)+1 FROM departments), 1), false);
SELECT setval('doctors_doctor_id_seq', COALESCE((SELECT MAX(doctor_id)+1 FROM doctors), 1), false);
SELECT setval('patients_patient_id_seq', COALESCE((SELECT MAX(patient_id)+1 FROM patients), 1), false);

