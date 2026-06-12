import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Edit2, Trash2, X, Users, Save } from 'lucide-react';

export default function AdminPatients() {
  const addToast = useToast();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPatId, setSelectedPatId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await api.patients.getAll();
      if (res.success) setPatients(res.data);
    } catch (err) {
      addToast('Failed to load patient records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleOpenEdit = (pat) => {
    setSelectedPatId(pat.patient_id);
    setName(pat.name);
    setEmail(pat.email);
    setAge(pat.age || '');
    setGender(pat.gender || 'Male');
    setPhone(pat.phone || '');
    setAddress(pat.address || '');
    setBloodGroup(pat.blood_group || 'O+');
    setShowModal(true);
  };

  const handleDelete = async (patId) => {
    if (!window.confirm('Are you sure you want to delete this patient profile and history?')) return;
    try {
      const res = await api.patients.delete(patId);
      if (res.success) {
        addToast('Patient deleted successfully.', 'success');
        loadPatients();
      }
    } catch (err) {
      addToast('Failed to delete patient.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        age: parseInt(age),
        gender,
        phone,
        address,
        bloodGroup
      };

      const res = await api.patients.update(selectedPatId, payload);
      if (res.success) {
        addToast('Patient demographics updated successfully.', 'success');
        setShowModal(false);
        loadPatients();
      }
    } catch (err) {
      addToast('Failed to update patient profile.', 'error');
    }
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Patient Registry</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Review profiles, edit demographic specifiers, and manage account statuses.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Filter patients by name..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '300px' }}></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No patients found in directories</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Age / Gender</th>
                <th>Phone Number</th>
                <th>Blood</th>
                <th>Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pat => (
                <tr key={pat.patient_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{pat.email}</div>
                  </td>
                  <td>{pat.age || 'N/A'} Yrs / {pat.gender || 'N/A'}</td>
                  <td>{pat.phone || 'N/A'}</td>
                  <td><span className="badge badge-pending">{pat.blood_group || 'O+'}</span></td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pat.address || 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(pat)} style={{ padding: '0.4rem' }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(pat.patient_id)} style={{ padding: '0.4rem', color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.1)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Patient Demographics</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

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
                <label className="form-label">Residential Address</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, gap: '0.25rem' }}>
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
