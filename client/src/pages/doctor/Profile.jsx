import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { UserSquare2, Save, Stethoscope } from 'lucide-react';

export default function DoctorProfile() {
  const { user, refreshProfile } = useAuth();
  const addToast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setSpecialization(user.specialization || '');
      setExperience(user.experience || '');
      setConsultationFee(user.consultationFee || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !specialization || !experience || !consultationFee) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (user.doctorId) {
        const res = await api.doctors.update(user.doctorId, {
          name,
          email,
          specialization,
          experience: parseInt(experience),
          consultationFee: parseFloat(consultationFee)
        });
        if (res.success) {
          addToast('Specialist clinical credentials updated.', 'success');
          await refreshProfile();
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <UserSquare2 size={28} color="hsl(var(--secondary))" />
        <h1 style={{ fontSize: '1.75rem' }}>Specialist Credentials Settings</h1>
      </div>

      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Physician Full Name</label>
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

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Specialization / Expertise</label>
            <input 
              type="text" 
              className="form-control"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Pediatric Surgery, Diagnostic Neurology"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Years of Experience</label>
              <input 
                type="number" 
                className="form-control"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Consultation Fee (₹)</label>
              <input 
                type="number" 
                className="form-control"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary"
            style={{ width: '100%', height: '44px', fontWeight: 700, gap: '0.375rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <Save size={16} />
            <span>{loading ? 'Saving Settings...' : 'Save Specialist Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
