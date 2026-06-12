import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { FileSpreadsheet, XCircle, RefreshCw, Filter, Calendar } from 'lucide-react';

export default function AdminAppointments() {
  const addToast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.appointments.getAll();
      if (res.success) setAppointments(res.data);
    } catch (err) {
      addToast('Failed to load global appointments directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment as administrator?')) return;
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

  // CSV Report Generator
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      addToast('No appointment records to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Patient Name', 'Patient Email', 'Doctor Name', 'Department', 'Date', 'Time', 'Status', 'Notes'];
    const rows = appointments.map(a => [
      a.appointment_id,
      a.patient_name,
      a.patient_email,
      a.doctor_name,
      a.department_name,
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.notes.replace(/"/g, '""') // escape double quotes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HMS_Appointments_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast('CSV spreadsheet downloaded successfully.', 'success');
  };

  // Filter pipeline
  const filtered = appointments.filter(a => {
    const matchesStatus = statusFilter === '' || a.status === statusFilter;
    const matchesSearch = search === '' || 
      a.patient_name.toLowerCase().includes(search.toLowerCase()) || 
      a.doctor_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Global Consultations Scheduler</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Monitor booking statuses, cancel colliding events, and compile spreadsheet audits.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleExportCSV} style={{ gap: '0.375rem', borderColor: 'rgba(16,185,129,0.2)', color: 'hsl(var(--success))' }}>
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-outline" onClick={loadAppointments} disabled={loading}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className="card" style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search patient name or physician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="hsl(var(--text-muted))" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Status:</span>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">All Bookings</option>
            <option value="Pending">Pending Approval</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Datatable */}
      {loading ? (
        <div className="skeleton" style={{ height: '300px' }}></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No appointments matching filter specifications</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Patient Details</th>
                <th>Assigned Specialist</th>
                <th>Schedule Date / Time</th>
                <th>Status</th>
                <th>Audit Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr key={appt.appointment_id}>
                  <td className="font-mono" style={{ fontWeight: 600 }}>#{String(appt.appointment_id).padStart(4, '0')}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{appt.patient_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{appt.patient_email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{appt.doctor_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{appt.department_name}</div>
                  </td>
                  <td>
                    <strong>{appt.appointment_date}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>at {appt.appointment_time}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appt.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(appt.status === 'Pending' || appt.status === 'Confirmed') ? (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCancel(appt.appointment_id)}
                        style={{ color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.15)', padding: '0.4rem' }}
                        title="Cancel Appointment"
                      >
                        <XCircle size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
