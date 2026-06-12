import { mockDb } from './mockDb';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('hms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to decode mock user ID from mock token
const getMockUser = () => {
  const token = localStorage.getItem('hms_token');
  if (token && token.startsWith('mock_jwt_token_user_')) {
    const userId = parseInt(token.replace('mock_jwt_token_user_', ''));
    const userRole = localStorage.getItem('hms_role');
    const userName = localStorage.getItem('hms_user_name');
    return { id: userId, role: userRole, name: userName };
  }
  return null;
};

// Main fetch wrapper with fallback logic
async function request(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, config);
    
    // If resource is PDF download, resolve as blob
    if (url.includes('/download')) {
      if (res.ok) return await res.blob();
      throw new Error('Failed to download PDF.');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Server request failed.');
    }
    return data; // returns consistent backend shape { success, data, message }
  } catch (error) {
    // Detect if network is unreachable
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('unreachable') || error.message.includes('NetworkError')) {
      console.warn(`⚠️ HMS Backend API (${API_BASE_URL}) is offline. Falling back to local Mock Database mode!`, error.message);
      return { isMockFallback: true, error };
    }
    throw error;
  }
}

// API Endpoints Mapping
export const api = {
  auth: {
    register: async (name, email, password, roleName, age, gender, phone, address, bloodGroup) => {
      const fallback = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, roleName, age, gender, phone, address, bloodGroup })
      });
      if (fallback.isMockFallback) {
        const result = mockDb.register(name, email, password, roleName, { age, gender, phone, address, bloodGroup });
        return { success: true, data: result, message: 'Mock Registration Successful' };
      }
      return fallback;
    },
    login: async (email, password) => {
      const fallback = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (fallback.isMockFallback) {
        const result = mockDb.login(email, password);
        return { success: true, data: result, message: 'Mock Login Successful' };
      }
      return fallback;
    },
    getProfile: async () => {
      const fallback = await request('/auth/profile');
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const result = mockDb.getProfile(mockUser.id);
        return { success: true, data: result, message: 'Mock Profile Loaded' };
      }
      return fallback;
    },
    changePassword: async (currentPassword, newPassword) => {
      const fallback = await request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        mockDb.changePassword(mockUser.id, currentPassword, newPassword);
        return { success: true, data: null, message: 'Mock Password Changed Successfully' };
      }
      return fallback;
    }
  },

  patients: {
    getAll: async () => {
      const fallback = await request('/patients');
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getPatients(), message: 'Mock Patients Loaded' };
      }
      return fallback;
    },
    getById: async (id) => {
      const fallback = await request(`/patients/${id}`);
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getProfile(parseInt(id)), message: 'Mock Patient Profile Loaded' };
      }
      return fallback;
    },
    create: async (data) => {
      const fallback = await request('/patients', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.register(data.name, data.email, data.password || 'patient123', 'patient', data);
        return { success: true, data: result.user, message: 'Mock Patient Created' };
      }
      return fallback;
    },
    update: async (id, data) => {
      const fallback = await request(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.updatePatientAdmin(id, data.name, data.email, data.age, data.gender, data.phone, data.address, data.bloodGroup);
        return { success: true, data: result, message: 'Mock Patient Updated' };
      }
      return fallback;
    },
    delete: async (id) => {
      const fallback = await request(`/patients/${id}`, { method: 'DELETE' });
      if (fallback.isMockFallback) {
        mockDb.deletePatientAdmin(id);
        return { success: true, data: null, message: 'Mock Patient Deleted' };
      }
      return fallback;
    }
  },

  doctors: {
    getAll: async (departmentId = '', search = '') => {
      const fallback = await request(`/doctors?department=${departmentId}&search=${search}`);
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getDoctors(departmentId, search), message: 'Mock Doctors Loaded' };
      }
      return fallback;
    },
    getById: async (id) => {
      const fallback = await request(`/doctors/${id}`);
      if (fallback.isMockFallback) {
        const doctors = mockDb.getDoctors();
        const doc = doctors.find(d => d.doctor_id === parseInt(id) || d.user_id === parseInt(id));
        if (!doc) throw new Error('Doctor not found (Mock)');
        return { success: true, data: doc, message: 'Mock Doctor Loaded' };
      }
      return fallback;
    },
    create: async (data) => {
      const fallback = await request('/doctors', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.createDoctorAdmin(data.name, data.email, data.password || 'doctor123', data.departmentId, data.specialization, data.experience, data.consultationFee);
        return { success: true, data: result.user, message: 'Mock Doctor Created' };
      }
      return fallback;
    },
    update: async (id, data) => {
      const fallback = await request(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.updateDoctorAdmin(id, data.name, data.email, data.departmentId, data.specialization, data.experience, data.consultationFee);
        return { success: true, data: result, message: 'Mock Doctor Updated' };
      }
      return fallback;
    },
    delete: async (id) => {
      const fallback = await request(`/doctors/${id}`, { method: 'DELETE' });
      if (fallback.isMockFallback) {
        mockDb.deleteDoctorAdmin(id);
        return { success: true, data: null, message: 'Mock Doctor Deleted' };
      }
      return fallback;
    }
  },

  appointments: {
    getAll: async () => {
      const fallback = await request('/appointments');
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const data = mockDb.getAppointments(mockUser.role, mockUser.id);
        return { success: true, data, message: 'Mock Appointments Loaded' };
      }
      return fallback;
    },
    getById: async (id) => {
      const fallback = await request(`/appointments/${id}`);
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        const appts = mockDb.getAppointments(mockUser.role, mockUser.id);
        const item = appts.find(a => a.appointment_id === parseInt(id));
        if (!item) throw new Error('Appointment not found (Mock)');
        return { success: true, data: item, message: 'Mock Appointment Loaded' };
      }
      return fallback;
    },
    book: async (doctorId, date, time, notes) => {
      const fallback = await request('/appointments', {
        method: 'POST',
        body: JSON.stringify({ doctorId, appointmentDate: date, appointmentTime: time, notes })
      });
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const result = mockDb.bookAppointment(doctorId, date, time, notes, mockUser);
        return { success: true, data: result, message: 'Mock Appointment Booked Successfully' };
      }
      return fallback;
    },
    updateStatus: async (id, status) => {
      const fallback = await request(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const result = mockDb.updateAppointmentStatus(id, status, mockUser);
        return { success: true, data: result, message: 'Mock Status Updated' };
      }
      return fallback;
    }
  },

  records: {
    getAll: async () => {
      const fallback = await request('/records');
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const data = mockDb.getRecords(mockUser.role, mockUser.id);
        return { success: true, data, message: 'Mock Records Loaded' };
      }
      return fallback;
    },
    getById: async (id) => {
      const fallback = await request(`/records/${id}`);
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        const records = mockDb.getRecords(mockUser.role, mockUser.id);
        const rec = records.find(r => r.record_id === parseInt(id));
        if (!rec) throw new Error('Record not found (Mock)');
        return { success: true, data: rec, message: 'Mock Record Loaded' };
      }
      return fallback;
    },
    create: async (data) => {
      const fallback = await request('/records', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const mockUser = getMockUser();
        if (!mockUser) throw new Error('Unauthenticated (Mock)');
        const result = mockDb.createRecord(
          data.patientId,
          data.diagnosis,
          data.treatment,
          data.visitDate,
          data.notes,
          data.medicines,
          data.dosage,
          data.duration,
          data.instructions,
          mockUser.id
        );
        return { success: true, data: result, message: 'Mock Medical Record Created' };
      }
      return fallback;
    }
  },

  prescriptions: {
    getByRecordId: async (recordId) => {
      const fallback = await request(`/prescriptions/${recordId}`);
      if (fallback.isMockFallback) {
        const records = mockDb.getRecords();
        const rec = records.find(r => r.record_id === parseInt(recordId));
        if (!rec || !rec.prescription_id) throw new Error('Prescription not found (Mock)');
        return {
          success: true,
          data: {
            prescription_id: rec.prescription_id,
            record_id: rec.record_id,
            medicines: rec.medicines,
            dosage: rec.dosage,
            duration: rec.duration,
            instructions: rec.instructions
          },
          message: 'Mock Prescription Loaded'
        };
      }
      return fallback;
    },
    downloadPdf: async (id) => {
      try {
        const fallback = await request(`/prescriptions/${id}/download`);
        if (fallback instanceof Blob) return fallback;
      } catch (err) {
        console.error('PDF fetch error:', err);
      }
      
      // Fallback PDF generation: simulate file blob
      console.log('Simulating PDF blob client-side...');
      const dummyPdfContent = `%PDF-1.4 mock prescription pdf metadata id: ${id}`;
      return new Blob([dummyPdfContent], { type: 'application/pdf' });
    }
  },

  departments: {
    getAll: async () => {
      const fallback = await request('/departments');
      if (fallback.isMockFallback) {
        const doctors = mockDb.getDoctors();
        const depts = mockDb.getDepartments();
        
        // Append doctor count
        const detailed = depts.map(d => {
          const count = doctors.filter(doc => doc.department_id === d.department_id).length;
          return { ...d, doctor_count: count };
        });
        
        return { success: true, data: detailed, message: 'Mock Departments Loaded' };
      }
      return fallback;
    },
    create: async (data) => {
      const fallback = await request('/departments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.createDepartment(data.departmentName, data.description);
        return { success: true, data: result, message: 'Mock Department Created' };
      }
      return fallback;
    },
    update: async (id, data) => {
      const fallback = await request(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (fallback.isMockFallback) {
        const result = mockDb.updateDepartment(id, data.departmentName, data.description);
        return { success: true, data: result, message: 'Mock Department Updated' };
      }
      return fallback;
    },
    delete: async (id) => {
      const fallback = await request(`/departments/${id}`, { method: 'DELETE' });
      if (fallback.isMockFallback) {
        mockDb.deleteDepartment(id);
        return { success: true, data: null, message: 'Mock Department Deleted' };
      }
      return fallback;
    }
  },

  analytics: {
    getOverview: async () => {
      const fallback = await request('/analytics/overview');
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getAnalyticsOverview(), message: 'Mock Analytics Overview Loaded' };
      }
      return fallback;
    },
    getAppointmentsByStatus: async () => {
      const fallback = await request('/analytics/appointments-by-status');
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getAppointmentsByStatus(), message: 'Mock Status Analytics Loaded' };
      }
      return fallback;
    },
    getAppointmentsByDepartment: async () => {
      const fallback = await request('/analytics/appointments-by-department');
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getAppointmentsByDepartment(), message: 'Mock Department Analytics Loaded' };
      }
      return fallback;
    },
    getMonthlyStats: async () => {
      const fallback = await request('/analytics/monthly-stats');
      if (fallback.isMockFallback) {
        return { success: true, data: mockDb.getMonthlyStats(), message: 'Mock Monthly Stats Loaded' };
      }
      return fallback;
    }
  },

  notifications: {
    getAll: async () => {
      const mockUser = getMockUser();
      if (!mockUser) return { success: true, data: [] };
      return { success: true, data: mockDb.getNotifications(mockUser.id), message: 'Mock Notifications Loaded' };
    },
    markRead: async () => {
      const mockUser = getMockUser();
      if (!mockUser) return { success: true };
      mockDb.markNotificationsRead(mockUser.id);
      return { success: true, message: 'Mock Notifications marked as read' };
    }
  }
};
