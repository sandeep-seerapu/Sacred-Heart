import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, CalendarRange, CalendarDays, FileText, UserSquare2,
  Users2, Landmark, ShieldAlert, Stethoscope, Clock, LogOut, X, Heart
} from 'lucide-react';

export default function Sidebar({ currentHash, isOpen, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case 'patient':
        return [
          { label: 'Dashboard', hash: '#patient/dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'Book Appointment', hash: '#patient/book-appointment', icon: <CalendarRange size={18} /> },
          { label: 'My Appointments', hash: '#patient/appointments', icon: <CalendarDays size={18} /> },
          { label: 'Medical History', hash: '#patient/records', icon: <FileText size={18} /> },
          { label: 'Profile Settings', hash: '#patient/profile', icon: <UserSquare2 size={18} /> },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', hash: '#doctor/dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'My Schedule', hash: '#doctor/appointments', icon: <CalendarDays size={18} /> },
          { label: 'Patient EMR List', hash: '#doctor/patients', icon: <Users2 size={18} /> },
          { label: 'Availability', hash: '#doctor/availability', icon: <Clock size={18} /> },
          { label: 'Profile Settings', hash: '#doctor/profile', icon: <UserSquare2 size={18} /> },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', hash: '#admin/dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'Manage Doctors', hash: '#admin/doctors', icon: <Stethoscope size={18} /> },
          { label: 'Manage Patients', hash: '#admin/patients', icon: <Users2 size={18} /> },
          { label: 'Departments', hash: '#admin/departments', icon: <Landmark size={18} /> },
          { label: 'Appointments List', hash: '#admin/appointments', icon: <CalendarRange size={18} /> },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '1.15rem' }}>
            <Heart size={22} fill="hsl(var(--primary))" />
            <span>EMR Portal</span>
          </div>
          <button className="mobile-close" onClick={onClose} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, index) => {
            const isActive = currentHash === item.hash;
            return (
              <li key={index}>
                <a 
                  href={item.hash} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', wordBreak: 'break-all' }}>
            Logged in as:<br />
            <strong style={{ color: 'hsl(var(--text-main))' }}>{user.email}</strong>
          </div>
          <button 
            className="sidebar-link" 
            onClick={logout}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', marginTop: '0.5rem', color: 'hsl(var(--danger))' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (as requested for mobile viewport) */}
      <nav className="mobile-nav">
        {menuItems.slice(0, 4).map((item, index) => {
          const isActive = currentHash === item.hash;
          return (
            <a 
              key={index} 
              href={item.hash} 
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>{item.label.split(' ')[0]}</span>
            </a>
          );
        })}
        <button className="mobile-nav-item" onClick={logout} style={{ border: 'none', background: 'transparent' }}>
          <LogOut size={18} />
          <span style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>Exit</span>
        </button>
      </nav>

      <style>{`
        .mobile-close { display: none; }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 260px;
            box-shadow: 4px 0 10px rgba(0,0,0,0.15);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
