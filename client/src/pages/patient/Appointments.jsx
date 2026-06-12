import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Calendar, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export default function Appointments() {
  const addToast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.appointments.getAll();
      if (res.success) setAppointments(res.data);
    } catch (err) {
      addToast('Failed to load appointments registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.appointments.updateStatus(apptId, 'Cancelled');
      if (res.success) {
        addToast('Appointment cancelled successfully.', 'success');
        loadAppointments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel appointment.', 'error');
    }
  };

  // Filter categorization
  const getFiltered = () => {
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');
      case 'past':
        return appointments.filter(a => a.status === 'Completed');
      case 'cancelled':
        return appointments.filter(a => a.status === 'Cancelled');
      default:
        return [];
    }
  };

  const filteredAppts = getFiltered();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Appointments</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Track, modify, and review your doctor consultations schedule.</p>
        </div>
        <button className="btn btn-outline" onClick={loadAppointments} disabled={loading} style={{ gap: '0.375rem' }}>
          <RefreshCw size={14} className={loading ? 'pulse' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Selectors */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid hsl(var(--border))',
        marginBottom: '1.5rem',
        gap: '1.5rem'
      }}>
        {['upcoming', 'past', 'cancelled'].map((tab) => {
          const isActive = activeTab === tab;
          const count = appointments.filter(a => {
            if (tab === 'upcoming') return a.status === 'Pending' || a.status === 'Confirmed';
            if (tab === 'past') return a.status === 'Completed';
            return a.status === 'Cancelled';
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
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{tab}</span>
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

      {/* Grid listing */}
      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filteredAppts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No appointments in this group</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Go to "Book Appointment" to add a consultation slot.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppts.map((appt) => {
            const canCancel = appt.status === 'Pending' || appt.status === 'Confirmed';
            return (
              <div key={appt.appointment_id} className="card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                padding: '1.25rem 1.75rem'
              }}>
                {/* Specialist and Department */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
                    {appt.department_name}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', margin: '0.15rem 0' }}>{appt.doctor_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                    Specialization: <strong>{appt.specialization}</strong>
                  </p>
                  {appt.notes && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'hsl(var(--text-muted))',
                      backgroundColor: 'hsl(var(--bg-main))',
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      maxWidth: '500px'
                    }}>
                      Reason: "{appt.notes}"
                    </div>
                  )}
                </div>

                {/* Date / Time */}
                <div style={{ minWidth: '150px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Scheduled Slot</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, margin: '0.15rem 0' }}>{appt.appointment_date}</div>
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>at {appt.appointment_time}</div>
                </div>

                {/* Status & Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span className={`badge badge-${appt.status.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    {appt.status}
                  </span>

                  {canCancel ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleCancel(appt.appointment_id)}
                      style={{
                        padding: '0.5rem',
                        color: 'hsl(var(--danger))',
                        borderColor: 'rgba(239,68,68,0.2)',
                        backgroundColor: 'rgba(239,68,68,0.02)'
                      }}
                      title="Cancel Appointment"
                    >
                      <XCircle size={18} />
                    </button>
                  ) : (
                    <div style={{ width: '38px' }}></div> /* alignment placeholder */
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pulse { animation: rotate 1.5s infinite linear; }
      `}</style>
    </div>
  );
}
