import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout Wrappers
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/public/Home';
import Doctors from './pages/public/Doctors';
import Contact from './pages/public/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Dashboard Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientRecords from './pages/patient/Records';
import PatientProfile from './pages/patient/Profile';

// Doctor Dashboard Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorAvailability from './pages/doctor/Availability';
import DoctorProfile from './pages/doctor/Profile';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminDepartments from './pages/admin/Departments';
import AdminAppointments from './pages/admin/Appointments';

function AppContent() {
  const { user, loading } = useAuth();
  const [hash, setHash] = useState(window.location.hash || '#home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#home');
      setMobileMenuOpen(false); // Close mobile menus on link clicks
      window.scrollTo(0, 0); // scroll to top
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'hsl(var(--bg-main))'
      }}>
        <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '60px' }}></div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>
          Loading Sacred Heart EMR Portal...
        </div>
      </div>
    );
  }

  // Route Guard Redirects
  const isDashboardRoute = hash.startsWith('#patient/') || hash.startsWith('#doctor/') || hash.startsWith('#admin/');
  const currentRole = user?.role;

  // Perform Redirects
  if (isDashboardRoute && !user) {
    // Redirect unauthenticated requests to login
    setTimeout(() => { window.location.hash = '#login'; }, 0);
    return null;
  }

  if (hash.startsWith('#patient/') && currentRole !== 'patient') {
    setTimeout(() => { window.location.hash = '#login'; }, 0);
    return null;
  }
  if (hash.startsWith('#doctor/') && currentRole !== 'doctor') {
    setTimeout(() => { window.location.hash = '#login'; }, 0);
    return null;
  }
  if (hash.startsWith('#admin/') && currentRole !== 'admin') {
    setTimeout(() => { window.location.hash = '#login'; }, 0);
    return null;
  }

  // Render Target Component
  const renderPage = () => {
    switch (hash) {
      // Public / General
      case '#home':
        return <Home />;
      case '#doctors':
        return <Doctors />;
      case '#contact':
        return <Contact />;
      case '#login':
        return <Login />;
      case '#register':
        return <Register />;
      
      // Patient Dashboard
      case '#patient/dashboard':
        return <PatientDashboard />;
      case '#patient/book-appointment':
        return <BookAppointment />;
      case '#patient/appointments':
        return <PatientAppointments />;
      case '#patient/records':
        return <PatientRecords />;
      case '#patient/profile':
        return <PatientProfile />;

      // Doctor Dashboard
      case '#doctor/dashboard':
        return <DoctorDashboard />;
      case '#doctor/appointments':
        return <DoctorAppointments />;
      case '#doctor/patients':
        return <DoctorPatients />;
      case '#doctor/availability':
        return <DoctorAvailability />;
      case '#doctor/profile':
        return <DoctorProfile />;

      // Admin Dashboard
      case '#admin/dashboard':
        return <AdminDashboard />;
      case '#admin/doctors':
        return <AdminDoctors />;
      case '#admin/patients':
        return <AdminPatients />;
      case '#admin/departments':
        return <AdminDepartments />;
      case '#admin/appointments':
        return <AdminAppointments />;

      default:
        // Default fallback: Home
        return <Home />;
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Navbar (sticky everywhere) */}
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

      {isDashboardRoute ? (
        /* DASHBOARD LAYOUT (Sidebar + Main panel) */
        <div className="app-container">
          <Sidebar 
            currentHash={hash} 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
          />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      ) : (
        /* PUBLIC PAGE LAYOUT (Centered container + Footer) */
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1 }}>
            {renderPage()}
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}
