import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Clock, ClipboardList, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.appointments.getAll();
        if (res.success) setAppointments(res.data);
      } catch (err) {
        console.error('Failed to load doctor schedules:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date === todayStr && a.status !== 'Cancelled').sort((a,b) => a.appointment_time.localeCompare(b.appointment_time));
  
  const pendingApprovals = appointments.filter(a => a.status === 'Pending');
  
  // Calculate distinct patients
  const patientCount = new Set(appointments.map(a => a.patient_id)).size;

  if (loading) {
    return <div className="skeleton" style={{ height: '300px' }}></div>;
  }

  return (
    <div>
      {/* Welcome */}
      <div className="card card-glass" style={{
        padding: '2rem',
        marginBottom: '2rem',
        borderLeft: '5px solid hsl(var(--secondary))'
      }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome, {user.name}</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
          Specialist: <strong>{user.specialization || 'Diagnostic Neurology'}</strong> | Department: <strong>{user.departmentName || 'Neurology'}</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'hsl(var(--secondary))' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value">{todayAppts.length}</div>
            <div className="stat-label">Appointments Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'hsl(var(--success))' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{patientCount}</div>
            <div className="stat-label">Active Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'hsl(var(--warning))' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{pendingApprovals.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }} className="doctor-grid-layout">
        
        {/* Left Side: Today's Schedule Timeline */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Today's Timeline ({todayStr})</h2>

          {todayAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'hsl(var(--text-muted))' }}>
              <Clock size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No consultations scheduled for today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', borderLeft: '2px solid hsl(var(--border))', marginLeft: '1rem', paddingLeft: '1.5rem', gap: '1.5rem' }}>
              {todayAppts.map((appt) => (
                <div key={appt.appointment_id} style={{ position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: appt.status === 'Completed' ? 'hsl(var(--success))' : 'hsl(var(--secondary))',
                    border: '3px solid hsl(var(--bg-card))'
                  }}></div>

                  {/* Timeline content */}
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                        🕒 {appt.appointment_time}
                      </span>
                      <span className={`badge badge-${appt.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {appt.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', margin: '0.25rem 0' }}>Patient: {appt.patient_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Contact: {appt.patient_phone || 'No phone'}</p>
                    {appt.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        " {appt.notes} "
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick Links / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>EMR Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="#doctor/appointments" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                📅 Review Appointment Requests ({pendingApprovals.length})
              </a>
              <a href="#doctor/patients" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                ✍️ Write Patient Diagnosis & Rx
              </a>
              <a href="#doctor/availability" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                ⚙️ Adjust Weekly Availability
              </a>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .doctor-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
