import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, Menu, User, LogOut, Heart } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hms_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('hms_dark_mode', darkMode);
  }, [darkMode]);

  return (
    <nav style={{
      height: '70px',
      backgroundColor: 'hsl(var(--bg-card))',
      borderBottom: '1px solid hsl(var(--border))',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand & Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onMobileMenuToggle} 
          style={{ cursor: 'pointer' }}
          className="mobile-burger"
        >
          <Menu size={24} />
        </button>
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '1.25rem' }}>
          <Heart size={24} fill="hsl(var(--primary))" />
          <span>Sacred Heart</span>
        </a>
      </div>

      {/* Right Menu (Actions, Auth, Dark Mode) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Public Links (only shown if not fully logged in to dashboard) */}
        {!user && (
          <div className="nav-public-links" style={{ display: 'flex', gap: '1.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
            <a href="#home" className="hover-primary">Home</a>
            <a href="#doctors" className="hover-primary">Our Doctors</a>
            <a href="#about" className="hover-primary">About Us</a>
            <a href="#contact" className="hover-primary">Contact</a>
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            color: 'hsl(var(--text-main))'
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Auth status / Profile */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
            <a 
              href={`#${user.role}/dashboard`} 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
              title="Dashboard"
            >
              {user.name.charAt(0)}
            </a>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={logout}
              style={{ padding: '0.35rem 0.6rem', color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <LogOut size={14} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="#login" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>Sign In</a>
            <a href="#register" className="btn btn-primary btn-sm" style={{ fontSize: '0.8rem' }}>Register</a>
          </div>
        )}
      </div>

      <style>{`
        .hover-primary:hover { color: hsl(var(--primary)); }
        .mobile-burger { display: none !important; }
        @media (max-width: 768px) {
          .nav-public-links { display: none !important; }
          .logout-text { display: none; }
          .mobile-burger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
