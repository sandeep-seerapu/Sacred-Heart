import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, FileHeart, ClipboardList, AlertCircle, Bell, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apptsRes, recordsRes, notifsRes] = await Promise.all([
          api.appointments.getAll(),
          api.records.getAll(),
          api.notifications.getAll()
        ]);
        if (apptsRes.success) setAppointments(apptsRes.data);
        if (recordsRes.success) setRecords(recordsRes.data);
        if (notifsRes.success) setNotifications(notifsRes.data);
      } catch (err) {
        console.error('Failed to load patient dashboard resources:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const upcomingAppts = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').slice(0, 5);
  const recentRecords = records.slice(0, 3);
  const unreadNotifs = notifications.filter(n => !n.is_read);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="skeleton" style={{ width: '40%', height: '2rem', marginBottom: '2rem' }}></div>
        <div className="stats-container">
          <div className="skeleton" style={{ height: '100px' }}></div>
          <div className="skeleton" style={{ height: '100px' }}></div>
          <div className="skeleton" style={{ height: '100px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Card */}
      <div className="card card-glass" style={{
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: '5px solid hsl(var(--primary))'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back, {user.name}!</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
            Blood Group: <strong>{user.bloodGroup || 'O+'}</strong> | Gender: <strong>{user.gender || 'Male'}</strong> | Age: <strong>{user.age || 35} yrs</strong>
          </p>
        </div>
        <a href="#patient/book-appointment" className="btn btn-primary">
          <Calendar size={16} />
          <span>Book Appointment</span>
        </a>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'hsl(var(--secondary))' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value">{appointments.filter(a => a.status !== 'Cancelled').length}</div>
            <div className="stat-label">Scheduled Visits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'hsl(var(--success))' }}>
            <FileHeart size={22} />
          </div>
          <div>
            <div className="stat-value">{records.length}</div>
            <div className="stat-label font-mono">EMR Records</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'hsl(var(--warning))' }}>
            <Bell size={22} />
          </div>
          <div>
            <div className="stat-value">{unreadNotifs.length}</div>
            <div className="stat-label">New Alerts</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }} className="patient-grid-layout">
        
        {/* Left Side: Upcoming Appointments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Upcoming Appointments</h2>
              <a href="#patient/appointments" style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>View All</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {upcomingAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>No upcoming appointments scheduled.</p>
                <a href="#patient/book-appointment" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>Book Now</a>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', marginTop: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialty</th>
                      <th>Date / Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppts.map((appt) => (
                      <tr key={appt.appointment_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{appt.doctor_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{appt.department_name}</div>
                        </td>
                        <td>{appt.specialization}</td>
                        <td>
                          <strong>{appt.appointment_date}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>at {appt.appointment_time}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${appt.status.toLowerCase()}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Diagnoses / Records */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Recent Medical History</h2>
              <a href="#patient/records" style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>See All EMR</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {recentRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <ClipboardList size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>No medical history logged yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentRecords.map((rec) => (
                  <div key={rec.record_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{rec.visit_date} | diagnosed by {rec.doctor_name}</div>
                      <h4 style={{ margin: '0.25rem 0 0.1rem', fontSize: '1rem' }}>{rec.diagnosis}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Treatment: {rec.treatment}</p>
                    </div>
                    {rec.prescription_id && (
                      <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>Rx Attached</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Notifications / Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ flexGrow: 1 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="hsl(var(--primary))" />
              <span>Portal Alerts</span>
            </h2>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.8rem' }}>No recent notifications.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} style={{
                    padding: '0.75rem',
                    borderLeft: `3px solid ${n.is_read ? 'hsl(var(--border))' : 'hsl(var(--primary))'}`,
                    backgroundColor: n.is_read ? 'transparent' : 'rgba(var(--primary-rgb), 0.03)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: '0.8rem'
                  }}>
                    <p style={{ color: 'hsl(var(--text-main))', fontWeight: n.is_read ? 400 : 500 }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem', display: 'block' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .patient-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
