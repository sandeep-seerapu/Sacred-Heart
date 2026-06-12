import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, UserCog, CalendarCheck, Landmark, IndianRupee, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, revenue: 0 });
  const [statusStats, setStatusStats] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const [overRes, statusRes, deptRes, monthlyRes] = await Promise.all([
          api.analytics.getOverview(),
          api.analytics.getAppointmentsByStatus(),
          api.analytics.getAppointmentsByDepartment(),
          api.analytics.getMonthlyStats()
        ]);

        if (overRes.success) setOverview(overRes.data);
        if (statusRes.success) setStatusStats(statusRes.data);
        if (deptRes.success) setDeptStats(deptRes.data);
        if (monthlyRes.success) setMonthlyStats(monthlyRes.data);
      } catch (err) {
        console.error('Failed to load administrative analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, []);

  const COLORS = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }}></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Hospital Operations Analytics</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Real-time clinic metrics, specialists capacity, and appointment volume analysis.</p>
      </div>

      {/* Overview stats */}
      <div className="stats-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--primary-rgb),0.1)', color: 'hsl(var(--primary))' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{overview.totalPatients}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'hsl(var(--secondary))' }}>
            <UserCog size={22} />
          </div>
          <div>
            <div className="stat-value">{overview.totalDoctors}</div>
            <div className="stat-label">Consulting Doctors</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'hsl(var(--success))' }}>
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{overview.totalAppointments}</div>
            <div className="stat-label">Appointments booked</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'hsl(var(--warning))' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="stat-value">₹{overview.revenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }} className="admin-charts-grid">
        
        {/* Monthly bar chart */}
        <div className="card" style={{ minHeight: '380px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Monthly Consultation Volumes</h2>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--bg-card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius-sm)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Appointments by Department</h2>
          
          {deptStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'hsl(var(--text-muted))', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No department data available.
            </div>
          ) : (
            <div style={{ flexGrow: 1, width: '100%', height: '240px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptStats}
                    dataKey="count"
                    nameKey="department_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {deptStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {deptStats.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }}></div>
                    <span>{entry.department_name} ({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom: Activity log */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="hsl(var(--primary))" />
          <span>System Audit Activity Log</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
            <span style={{ color: 'hsl(var(--text-muted))' }}>Jun 11, 2026 21:10</span>
            <span style={{ flexGrow: 1, marginLeft: '2rem' }}>Administrator updated Cardiology department details.</span>
            <span className="badge badge-completed">Success</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
            <span style={{ color: 'hsl(var(--text-muted))' }}>Jun 11, 2026 20:45</span>
            <span style={{ flexGrow: 1, marginLeft: '2rem' }}>Doctor Arjun Mehta completed record consultation for Rahul Verma.</span>
            <span className="badge badge-completed">Success</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ color: 'hsl(var(--text-muted))' }}>Jun 11, 2026 18:20</span>
            <span style={{ flexGrow: 1, marginLeft: '2rem' }}>New patient account registered (email: john@example.com).</span>
            <span className="badge badge-completed">Success</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
