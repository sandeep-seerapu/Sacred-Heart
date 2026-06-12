import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { User, Mail, Lock, Phone, MapPin, Heart, ShieldAlert, Check } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const addToast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const nextStep = () => {
    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) {
        addToast('Please fill out all credentials fields.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        return;
      }
      if (password.length < 6) {
        addToast('Password must be at least 6 characters long.', 'warning');
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!age || !phone || !address) {
      addToast('Please fill in age, phone, and address details.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, 'patient', parseInt(age), gender, phone, address, bloodGroup);
      addToast('Profile created successfully! Welcome to Sacred Heart.', 'success');
      window.location.hash = '#patient/dashboard';
    } catch (err) {
      addToast(err.message || 'Registration failed. Try checking your network.', 'error');
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
      padding: '2.5rem 1rem',
      backgroundColor: 'hsl(var(--bg-main))'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Patient Profile</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>Access doctors, records, and digital prescriptions.</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: step === 1 ? 'hsl(var(--primary))' : 'hsl(var(--success))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            {step > 1 ? <Check size={14} /> : '1'}
          </div>
          <div style={{ width: '60px', height: '2px', backgroundColor: step === 2 ? 'hsl(var(--success))' : 'hsl(var(--border))' }}></div>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: step === 2 ? 'hsl(var(--primary))' : 'hsl(var(--bg-main))',
            color: step === 2 ? 'white' : 'hsl(var(--text-muted))',
            border: step === 2 ? 'none' : '1px solid hsl(var(--border))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            2
          </div>
        </div>

        {/* Form Wizard */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {step === 1 ? (
            /* STEP 1: Account Credentials */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                  />
                </div>
              </div>

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
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="password" 
                    placeholder="Enter password (minimum 6 characters)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                  />
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '44px', fontWeight: 700, marginTop: '0.5rem' }}
                onClick={nextStep}
              >
                Next Step &rarr;
              </button>
            </div>
          ) : (
            /* STEP 2: Profile Specifications */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Age</label>
                  <input 
                    type="number" 
                    placeholder="Enter age" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="form-control"
                    style={{ height: '42px' }}
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="form-control"
                    style={{ height: '42px' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: 'hsl(var(--text-muted))' }} />
                    <input 
                      type="tel" 
                      placeholder="Enter 10-digit mobile number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '32px', height: '42px' }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Blood Group</label>
                  <select 
                    value={bloodGroup} 
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="form-control"
                    style={{ height: '42px' }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Residential Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="text" 
                    placeholder="Enter residential address" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1, height: '44px' }}
                  onClick={prevStep}
                >
                  &larr; Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2, height: '44px', fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Profile'}
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Already registered?{' '}
          <a href="#login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Sign in instead</a>
        </div>

      </div>
    </div>
  );
}
