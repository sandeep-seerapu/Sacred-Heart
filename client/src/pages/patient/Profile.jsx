import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { UserSquare2, Save, User, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const addToast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAge(user.age || '');
      setGender(user.gender || 'Male');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setBloodGroup(user.bloodGroup || 'O+');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !age || !phone || !address) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // If user is patient, we use api.patients.update using patientId
      if (user.patientId) {
        const res = await api.patients.update(user.patientId, {
          name,
          email,
          age: parseInt(age),
          gender,
          phone,
          address,
          bloodGroup
        });
        if (res.success) {
          addToast('EMR profile updated successfully.', 'success');
          await refreshProfile();
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to update EMR profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <UserSquare2 size={28} color="hsl(var(--primary))" />
        <h1 style={{ fontSize: '1.75rem' }}>Profile Settings</h1>
      </div>

      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Age</label>
              <input 
                type="number" 
                className="form-control"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Gender</label>
              <select 
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
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
              <input 
                type="text" 
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Blood Group</label>
              <select 
                className="form-control"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
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
            <label className="form-label">Address</label>
            <input 
              type="text" 
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', fontWeight: 700, gap: '0.375rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <Save size={16} />
            <span>{loading ? 'Saving Settings...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
