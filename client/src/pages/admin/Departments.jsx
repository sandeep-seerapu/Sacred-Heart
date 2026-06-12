import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, X, Landmark, Save } from 'lucide-react';

export default function AdminDepartments() {
  const addToast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  // Form Fields
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.departments.getAll();
      if (res.success) setDepartments(res.data);
    } catch (err) {
      addToast('Failed to load departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setDepartmentName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEdit(true);
    setSelectedDeptId(dept.department_id);
    setDepartmentName(dept.department_name);
    setDescription(dept.description);
    setShowModal(true);
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to remove this department? This will affect doctor specialization linkages.')) return;
    try {
      const res = await api.departments.delete(deptId);
      if (res.success) {
        addToast('Department deleted successfully.', 'success');
        loadDepartments();
      }
    } catch (err) {
      addToast('Failed to delete department.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { departmentName, description };
      let res;
      if (isEdit) {
        res = await api.departments.update(selectedDeptId, payload);
      } else {
        res = await api.departments.create(payload);
      }

      if (res.success) {
        addToast(isEdit ? 'Department updated successfully.' : 'Department added successfully.', 'success');
        setShowModal(false);
        loadDepartments();
      }
    } catch (err) {
      addToast(err.message || 'Error saving department.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Medical Departments</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Define medical fields, specialization tags, and track clinical staff distribution.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ gap: '0.375rem' }}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : (
        /* Grid of cards */
        <div className="grid-cols-3">
          {departments.map(dept => (
            <div key={dept.department_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(var(--primary-rgb),0.08)',
                  color: 'hsl(var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Landmark size={22} />
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(dept)} style={{ padding: '0.35rem' }}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(dept.department_id)} style={{ padding: '0.35rem', color: 'hsl(var(--danger))', borderColor: 'rgba(239,68,68,0.1)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{dept.department_name}</h3>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginTop: '0.5rem', flexGrow: 1, minHeight: '60px' }}>
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid hsl(var(--border))',
                paddingTop: '0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'hsl(var(--primary))'
              }}>
                👨‍⚕️ {dept.doctor_count || 0} Specializing Doctors
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEdit ? 'Edit Department Details' : 'Add New Department'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department Title</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Cardiology, Neurology"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea 
                  rows="4" 
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide brief details on the diagnostic equipment and treatment coverage..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, gap: '0.25rem' }}>
                  <Save size={16} />
                  <span>Save Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
