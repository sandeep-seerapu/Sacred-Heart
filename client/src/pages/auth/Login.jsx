import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { KeyRound, Mail, LogIn, Heart } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const addToast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      addToast(`Logged in successfully as ${res.user.name}!`, 'success');
      // Redirect based on role
      window.location.hash = `#${res.user.role}/dashboard`;
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'hsl(var(--bg-main))'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 2rem' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'hsl(var(--primary))', marginBottom: '1rem' }}>
            <Heart size={26} fill="hsl(var(--primary))" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Access EMR Portal</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>Enter credentials to enter your medical dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', height: '42px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: 500 }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', height: '42px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '44px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <a href="#register" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Create profile</a>
        </div>



      </div>
    </div>
  );
}
