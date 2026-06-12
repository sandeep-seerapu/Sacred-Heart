import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on init
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hms_token');
      const role = localStorage.getItem('hms_role');
      const name = localStorage.getItem('hms_user_name');
      const id = localStorage.getItem('hms_user_id');

      if (token && role) {
        setUser({ id: parseInt(id), name, role });
        
        // Optionally verify profile with server/mockDb on load
        try {
          const profileRes = await api.auth.getProfile();
          if (profileRes.success) {
            setUser({
              id: profileRes.data.id,
              name: profileRes.data.name,
              email: profileRes.data.email,
              role: profileRes.data.role,
              // Cache additional role-specific details
              patientId: profileRes.data.patient_id || null,
              doctorId: profileRes.data.doctor_id || null,
              age: profileRes.data.age || null,
              gender: profileRes.data.gender || null,
              phone: profileRes.data.phone || null,
              address: profileRes.data.address || null,
              bloodGroup: profileRes.data.blood_group || null,
              specialization: profileRes.data.specialization || null,
              experience: profileRes.data.experience || null,
              consultationFee: profileRes.data.consultation_fee || null,
              availabilitySchedule: profileRes.data.availability_schedule || null,
              departmentName: profileRes.data.department_name || null
            });
          }
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          // If profile fetch fails, don't log them out immediately in case it was a minor network glitch, 
          // but if they are mock, we fallback nicely.
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        const { token, user: userData } = res.data;
        
        localStorage.setItem('hms_token', token);
        localStorage.setItem('hms_role', userData.role);
        localStorage.setItem('hms_user_name', userData.name);
        localStorage.setItem('hms_user_id', userData.id.toString());
        
        setUser(userData);
        
        // Fetch full profile info to cache in state
        const profileRes = await api.auth.getProfile();
        if (profileRes.success) {
          const fullData = {
            id: profileRes.data.id,
            name: profileRes.data.name,
            email: profileRes.data.email,
            role: profileRes.data.role,
            patientId: profileRes.data.patient_id || null,
            doctorId: profileRes.data.doctor_id || null,
            age: profileRes.data.age || null,
            gender: profileRes.data.gender || null,
            phone: profileRes.data.phone || null,
            address: profileRes.data.address || null,
            bloodGroup: profileRes.data.blood_group || null,
            specialization: profileRes.data.specialization || null,
            experience: profileRes.data.experience || null,
            consultationFee: profileRes.data.consultation_fee || null,
            availabilitySchedule: profileRes.data.availability_schedule || null,
            departmentName: profileRes.data.department_name || null
          };
          setUser(fullData);
        }
        return { success: true, user: userData };
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, roleName, age, gender, phone, address, bloodGroup) => {
    setLoading(true);
    try {
      const res = await api.auth.register(name, email, password, roleName, age, gender, phone, address, bloodGroup);
      if (res.success) {
        const { token, user: userData } = res.data;
        
        localStorage.setItem('hms_token', token);
        localStorage.setItem('hms_role', userData.role);
        localStorage.setItem('hms_user_name', userData.name);
        localStorage.setItem('hms_user_id', userData.id.toString());
        
        setUser(userData);
        
        // Refresh full profile in state
        const profileRes = await api.auth.getProfile();
        if (profileRes.success) {
          setUser({
            id: profileRes.data.id,
            name: profileRes.data.name,
            email: profileRes.data.email,
            role: profileRes.data.role,
            patientId: profileRes.data.patient_id || null,
            doctorId: profileRes.data.doctor_id || null,
            age: profileRes.data.age || null,
            gender: profileRes.data.gender || null,
            phone: profileRes.data.phone || null,
            address: profileRes.data.address || null,
            bloodGroup: profileRes.data.blood_group || null
          });
        }
        return { success: true, user: userData };
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_role');
    localStorage.removeItem('hms_user_name');
    localStorage.removeItem('hms_user_id');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profileRes = await api.auth.getProfile();
      if (profileRes.success) {
        setUser(prev => ({
          ...prev,
          name: profileRes.data.name,
          email: profileRes.data.email,
          patientId: profileRes.data.patient_id || null,
          doctorId: profileRes.data.doctor_id || null,
          age: profileRes.data.age || null,
          gender: profileRes.data.gender || null,
          phone: profileRes.data.phone || null,
          address: profileRes.data.address || null,
          bloodGroup: profileRes.data.blood_group || null,
          specialization: profileRes.data.specialization || null,
          experience: profileRes.data.experience || null,
          consultationFee: profileRes.data.consultation_fee || null,
          availabilitySchedule: profileRes.data.availability_schedule || null,
          departmentName: profileRes.data.department_name || null
        }));
      }
    } catch (err) {
      console.error('Failed to refresh profile state:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
