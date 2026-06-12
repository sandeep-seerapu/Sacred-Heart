import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Search, FolderHeart, Plus, Users, X, ClipboardList, Stethoscope, Save } from 'lucide-react';

export default function DoctorPatients() {
  const addToast = useToast();
  
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal / Selection State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // EMR Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsRes, recordsRes] = await Promise.all([
        api.patients.getAll(),
        api.records.getAll()
      ]);
      if (patientsRes.success) setPatients(patientsRes.data);
      if (recordsRes.success) setMedicalRecords(recordsRes.data);
    } catch (err) {
      addToast('Failed to load patient records directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      addToast('Diagnosis is a required field.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.records.create({
        patientId: selectedPatient.patient_id,
        diagnosis,
        treatment,
        notes,
        medicines,
        dosage,
        duration,
        instructions,
        visitDate: new Date().toISOString().split('T')[0]
      });

      if (res.success) {
        addToast('Clinical record and prescription added successfully.', 'success');
        
        // Reset form
        setDiagnosis('');
        setTreatment('');
        setNotes('');
        setMedicines('');
        setDosage('');
        setDuration('');
        setInstructions('');
        setShowAddRecordModal(false);
        
        // Reload EMR
        await loadData();
        
        // Close sidebar to refresh layout
        setSelectedPatient(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit clinical record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter seen patients
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  );

  // Get records associated with selected patient
  const getPatientRecords = (patId) => {
    return medicalRecords.filter(r => r.patient_id === patId);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Patient EMR Directories</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Search profiles, view diagnostic histories, and log child/cardio reports.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 1fr' : '1fr', gap: '2rem' }} className="patients-grid-view">
        
        {/* LEFT PANEL: PATIENTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search box */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '24px', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              placeholder="Search patients by name or contact number..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '300px' }}></div>
          ) : filteredPatients.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3>No patients found in directories</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredPatients.map(pat => {
                const isSelected = selectedPatient?.patient_id === pat.patient_id;
                const recs = getPatientRecords(pat.patient_id);
                
                return (
                  <div 
                    key={pat.patient_id}
                    className="card"
                    onClick={() => setSelectedPatient(pat)}
                    style={{
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
                      backgroundColor: isSelected ? 'rgba(var(--primary-rgb),0.03)' : 'hsl(var(--bg-card))',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.25rem'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{pat.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                        <span>Age: {pat.age || 35} yrs</span>
                        <span>Gender: {pat.gender || 'Male'}</span>
                        <span>Blood: {pat.blood_group || 'O+'}</span>
                      </div>
                    </div>
                    <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                      {recs.length} Visits Logged
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SELECTED PATIENT DETAILS & CLINICAL HISTORY */}
        {selectedPatient && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>EMR FILE PREVIEW</span>
                <h2 style={{ fontSize: '1.35rem', marginTop: '0.15rem' }}>{selectedPatient.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedPatient(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Demographics details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              backgroundColor: 'hsl(var(--bg-main))',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Phone:</span> <strong>{selectedPatient.phone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Email:</span> <strong>{selectedPatient.email}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Address:</span> <strong>{selectedPatient.address || 'N/A'}</strong>
              </div>
            </div>

            {/* Action */}
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddRecordModal(true)}
              style={{ width: '100%', gap: '0.375rem' }}
            >
              <Plus size={16} />
              <span>Log Consultation & Rx</span>
            </button>

            {/* Past History Timeline */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={18} color="hsl(var(--primary))" />
                <span>Visit Diagnostics History</span>
              </h3>

              {getPatientRecords(selectedPatient.patient_id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed hsl(var(--border))', color: 'hsl(var(--text-muted))', borderRadius: 'var(--radius-sm)' }}>
                  No diagnostic history logs found for this patient.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getPatientRecords(selectedPatient.patient_id).map(rec => (
                    <div key={rec.record_id} style={{
                      padding: '1rem',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(var(--primary-rgb),0.01)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                        VISIT DATE: {rec.visit_date} | DIAGNOSED BY {rec.doctor_name}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', margin: '0.35rem 0 0.15rem' }}>{rec.diagnosis}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Treatment: {rec.treatment}</p>
                      
                      {rec.prescription_id && (
                        <div style={{
                          marginTop: '0.75rem',
                          borderTop: '1px dashed hsl(var(--border))',
                          paddingTop: '0.5rem',
                          fontSize: '0.8rem'
                        }}>
                          <span style={{ color: 'hsl(var(--success))', fontWeight: 700 }}>Rx Attached:</span>{' '}
                          <strong>{rec.medicines}</strong> ({rec.dosage} - {rec.duration})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* FORM OVERLAY: ADD CLINICAL RECORD MODAL */}
      {showAddRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={22} color="hsl(var(--primary))" />
                <span>Add EMR Record — {selectedPatient.name}</span>
              </h2>
              <button className="modal-close" onClick={() => setShowAddRecordModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* EMR Diagnosis Details */}
              <div style={{ borderBottom: '1px dashed hsl(var(--border))', paddingBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'hsl(var(--primary))' }}>Clinical Diagnostics</h3>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Diagnosis / Illness Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Treatment Plan / Therapy</label>
                  <textarea 
                    rows="2"
                    className="form-control"
                    placeholder="e.g. Bed rest, daily exercise, hydration plan"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Physician Progress Notes</label>
                  <textarea 
                    rows="2"
                    className="form-control"
                    placeholder="Additional clinical observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Rx Prescription details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'hsl(var(--success))' }}>Prescription Details (Rx)</h3>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Medications (comma-separated list)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lisinopril 10mg, Albuterol Inhaler"
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Dosage Schedule</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. 1 tablet daily, twice a day"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Course Duration</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. 14 Days, 1 Month"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Special Intake Instructions</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Take in the morning with water before food"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => setShowAddRecordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2, gap: '0.375rem', backgroundColor: 'hsl(var(--success))' }}
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>{submitting ? 'Saving EMR File...' : 'Commit Diagnosis & Rx'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .patients-grid-view { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
