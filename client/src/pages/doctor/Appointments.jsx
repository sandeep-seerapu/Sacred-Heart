import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Check, X, CalendarCheck, RefreshCw } from 'lucide-react';

export default function DoctorAppointments() {
  const addToast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.appointments.getAll();
      if (res.success) setAppointments(res.data);
    } catch (err) {
      addToast('Failed to load doctor appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.appointments.updateStatus(id, status);
      if (res.success) {
        addToast(`Appointment successfully marked as ${status}!`, 'success');
        loadAppointments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update appointment status.', 'error');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getFiltered = () => {
    switch (activeTab) {
      case 'pending':
        return appointments.filter(a => a.status === 'Pending');
      case 'today':
        return appointments.filter(a => a.appointment_date === todayStr && a.status === 'Confirmed');
      case 'upcoming':
        // Confirmed appointments after today
        return appointments.filter(a => a.appointment_date > todayStr && a.status === 'Confirmed');
      case 'past':
        return appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
      default:
        return [];
    }
  };

  const filtered = getFiltered();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Appointment Schedules</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Accept new patient slots, complete consultations, or review past charts.</p>
        </div>
        <button className="btn btn-outline" onClick={loadAppointments} disabled={loading}>
          <RefreshCw size={14} />
          <span style={{ marginLeft: '0.375rem' }}>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', marginBottom: '1.5rem', gap: '1.5rem' }}>
        {['pending', 'today', 'upcoming', 'past'].map(tab => {
          const isActive = activeTab === tab;
          const count = appointments.filter(a => {
            if (tab === 'pending') return a.status === 'Pending';
            if (tab === 'today') return a.appointment_date === todayStr && a.status === 'Confirmed';
            if (tab === 'upcoming') return a.appointment_date > todayStr && a.status === 'Confirmed';
            return a.status === 'Completed' || a.status === 'Cancelled';
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.75rem 0.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                borderBottom: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                marginBottom: '-2px',
                textTransform: 'capitalize'
              }}
            >
              <span>{tab} Requests</span>
              <span style={{
                marginLeft: '0.375rem',
                fontSize: '0.75rem',
                backgroundColor: isActive ? 'rgba(var(--primary-rgb),0.1)' : 'hsl(var(--bg-main))',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-pill)'
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <CalendarCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No appointments in this tab</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Patient schedule events will show here dynamically.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(appt => (
            <div key={appt.appointment_id} className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              padding: '1.25rem 1.75rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{appt.patient_name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'flex', gap: '1rem' }}>
                  <span>Age: <strong>{appt.patient_age || 35} yrs</strong></span>
                  <span>Gender: <strong>{appt.patient_gender || 'Male'}</strong></span>
                  <span>Phone: <strong>{appt.patient_phone || 'N/A'}</strong></span>
                </div>
                {appt.notes && (
                  <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-muted))',
                    backgroundColor: 'hsl(var(--bg-main))',
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    Symptoms: "{appt.notes}"
                  </p>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Consultation Date</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, margin: '0.15rem 0' }}>{appt.appointment_date}</div>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>at {appt.appointment_time}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge badge-${appt.status.toLowerCase()}`} style={{ marginRight: '0.5rem' }}>
                  {appt.status}
                </span>

                {appt.status === 'Pending' && (
                  <>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStatusUpdate(appt.appointment_id, 'Confirmed')}
                      style={{ color: 'hsl(var(--success))', borderColor: 'rgba(16,185,129,0.2)' }}
                      title="Accept Booking"
                    >
                      <Check size={16} />
                      <span>Accept</span>
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStatusUpdate(appt.appointment_id, 'Cancelled')}
                      style={{ color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.2)' }}
                      title="Reject Booking"
                    >
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {appt.status === 'Confirmed' && (
                  <a
                    href="#doctor/patients"
                    className="btn btn-primary btn-sm"
                  >
                    <span>Add Clinical Record</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
