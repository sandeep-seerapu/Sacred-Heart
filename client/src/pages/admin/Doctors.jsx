import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, X, Stethoscope, Save } from 'lucide-react';

export default function AdminDoctors() {
  const addToast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  const loadDoctorsAndDepts = async () => {
    setLoading(true);
    try {
      const [docsRes, deptsRes] = await Promise.all([
        api.doctors.getAll(),
        api.departments.getAll()
      ]);
      if (docsRes.success) setDoctors(docsRes.data);
      if (deptsRes.success) setDepartments(deptsRes.data);
    } catch (err) {
      addToast('Failed to load doctor listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorsAndDepts();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setName('');
    setEmail('');
    setPassword('');
    setDepartmentId(departments[0]?.department_id || '');
    setSpecialization('');
    setExperience('');
    setConsultationFee('');
    setShowModal(true);
  };

  const handleOpenEdit = (doc) => {
    setIsEdit(true);
    setSelectedDocId(doc.doctor_id);
    setName(doc.name);
    setEmail(doc.email);
    setPassword(''); // leave empty if not updating
    setDepartmentId(doc.department_id || '');
    setSpecialization(doc.specialization);
    setExperience(doc.experience);
    setConsultationFee(doc.consultation_fee);
    setShowModal(true);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this doctor profile?')) return;
    try {
      const res = await api.doctors.delete(docId);
      if (res.success) {
        addToast('Doctor removed successfully.', 'success');
        loadDoctorsAndDepts();
      }
    } catch (err) {
      addToast(err.message || 'Failed to remove doctor.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        password: password || undefined,
        departmentId: parseInt(departmentId),
        specialization,
        experience: parseInt(experience),
        consultationFee: parseFloat(consultationFee)
      };

      let res;
      if (isEdit) {
        res = await api.doctors.update(selectedDocId, payload);
      } else {
        res = await api.doctors.create(payload);
      }

      if (res.success) {
        addToast(isEdit ? 'Doctor updated successfully.' : 'Doctor registered successfully.', 'success');
        setShowModal(false);
        loadDoctorsAndDepts();
      }
    } catch (err) {
      addToast(err.message || 'Error saving doctor details.', 'error');
    }
  };

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Hospital Clinical Staff</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Add, update, or remove consulting physicians and specialists.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ gap: '0.375rem' }}>
          <Plus size={16} />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Filter doctors by name..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '300px' }}></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <Stethoscope size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No doctors registered</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Physician Details</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Fee</th>
                <th>Experience</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.doctor_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{doc.email}</div>
                  </td>
                  <td>{doc.department_name}</td>
                  <td>{doc.specialization}</td>
                  <td style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>₹{doc.consultation_fee}</td>
                  <td>{doc.experience} Years</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(doc)} style={{ padding: '0.4rem' }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(doc.doctor_id)} style={{ padding: '0.4rem', color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.1)' }}>
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

      {/* CRUD MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEdit ? 'Edit Doctor Profile' : 'Register New Doctor'}</h2>
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
                  placeholder="Enter full name"
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
                  placeholder="Enter email address"
                  required
                />
              </div>

              {!isEdit && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department</label>
                  <select 
                    className="form-control"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Specialization</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Enter specialization"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Consult Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, gap: '0.25rem' }}>
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
