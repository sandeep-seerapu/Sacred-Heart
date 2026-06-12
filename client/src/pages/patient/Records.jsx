import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { FileDown, Search, FolderHeart, User, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function Records() {
  const addToast = useToast();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await api.records.getAll();
        if (res.success) setRecords(res.data);
      } catch (err) {
        addToast('Failed to retrieve medical records.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  const handleDownloadPDF = async (prescriptionId, recordId) => {
    setDownloading(prescriptionId);
    try {
      const blob = await api.prescriptions.downloadPdf(prescriptionId || recordId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SacredHeart_Prescription_Rx_${prescriptionId || recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('Prescription PDF download initiated successfully.', 'success');
    } catch (err) {
      addToast('Error downloading prescription PDF.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const toggleExpand = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const filteredRecords = records.filter(r => 
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Electronic Medical Records</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Browse your clinical visit reports and download digital prescriptions.</p>
        </div>
      </div>

      {/* Search EMR */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '24px', color: 'hsl(var(--text-muted))' }} />
        <input 
          type="text" 
          placeholder="Filter EMR list by diagnosis or physician name..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filteredRecords.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <FolderHeart size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No medical records logged</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Records are created by consulting physicians following a Completed visit.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRecords.map((rec) => {
            const isExpanded = expandedRecord === rec.record_id;
            return (
              <div key={rec.record_id} className="card" style={{ padding: 0 }}>
                {/* Visible Card Summary Header */}
                <div 
                  onClick={() => toggleExpand(rec.record_id)}
                  style={{
                    padding: '1.25rem 1.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                      <Calendar size={12} />
                      <span>VISIT ON {rec.visit_date}</span>
                      <span>•</span>
                      <span style={{ color: 'hsl(var(--primary))' }}>{rec.doctor_name}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{rec.diagnosis}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {rec.prescription_id && (
                      <span className="badge badge-completed">Prescription Logged</span>
                    )}
                    {isExpanded ? <ChevronUp size={20} color="hsl(var(--text-muted))" /> : <ChevronDown size={20} color="hsl(var(--text-muted))" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid hsl(var(--border))',
                    padding: '1.5rem 1.75rem',
                    backgroundColor: 'rgba(var(--primary-rgb),0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    {/* Diagnostic notes & treatment */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '0.375rem' }}>Treatment Recommended</h4>
                      <p style={{ fontSize: '0.95rem' }}>{rec.treatment || 'No specific treatment logged.'}</p>
                    </div>

                    {rec.notes && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '0.375rem' }}>Doctor's Clinical Notes</h4>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{rec.notes}</p>
                      </div>
                    )}

                    {/* Prescription Box */}
                    {rec.prescription_id && (
                      <div className="card" style={{
                        backgroundColor: 'hsl(var(--bg-card))',
                        borderLeft: '4px solid hsl(var(--success))',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ color: 'hsl(var(--success))', fontSize: '1rem', fontWeight: 700 }}>Rx Medication Prescription</h4>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={downloading === rec.prescription_id}
                            onClick={() => handleDownloadPDF(rec.prescription_id, rec.record_id)}
                            style={{ gap: '0.25rem', backgroundColor: 'hsl(var(--success))' }}
                          >
                            <FileDown size={14} />
                            <span>{downloading === rec.prescription_id ? 'Downloading...' : 'Prescription PDF'}</span>
                          </button>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}>
                          <div>
                            <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Medicine Name</span>
                            <strong>{rec.medicines}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Dosage Schedule</span>
                            <strong>{rec.dosage}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Course Duration</span>
                            <strong>{rec.duration}</strong>
                          </div>
                        </div>

                        {rec.instructions && (
                          <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'hsl(var(--text-muted))', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.5rem' }}>
                            Instructions: {rec.instructions}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
