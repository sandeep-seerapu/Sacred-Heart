import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/NotificationContext';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00"];

export default function Availability() {
  const { user, refreshProfile } = useAuth();
  const addToast = useToast();

  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState('monday');
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.availabilitySchedule) {
      setSchedule(user.availabilitySchedule);
    } else {
      // Seed default
      const seeded = {};
      WEEKDAYS.slice(0, 5).forEach(day => {
        seeded[day] = [...DEFAULT_SLOTS];
      });
      setSchedule(seeded);
    }
  }, [user]);

  const handleToggleDay = (day) => {
    setSchedule(prev => {
      const updated = { ...prev };
      if (updated[day]) {
        delete updated[day];
      } else {
        updated[day] = [...DEFAULT_SLOTS];
      }
      return updated;
    });
  };

  const handleAddSlot = () => {
    if (!newSlot) return;
    setSchedule(prev => {
      const daySlots = prev[selectedDay] || [];
      if (daySlots.includes(newSlot)) {
        addToast('Time slot already exists for this day.', 'warning');
        return prev;
      }
      const updatedSlots = [...daySlots, newSlot].sort();
      return { ...prev, [selectedDay]: updatedSlots };
    });
    setNewSlot('');
  };

  const handleRemoveSlot = (day, slot) => {
    setSchedule(prev => {
      const daySlots = prev[day] || [];
      const updatedSlots = daySlots.filter(s => s !== slot);
      return { ...prev, [day]: updatedSlots };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user.doctorId) {
        const res = await api.doctors.update(user.doctorId, {
          availabilitySchedule: schedule
        });
        if (res.success) {
          addToast('Availability schedule saved successfully.', 'success');
          await refreshProfile();
        }
      }
    } catch (err) {
      addToast('Failed to save availability schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={28} color="hsl(var(--secondary))" />
          <h1 style={{ fontSize: '1.75rem' }}>Availability Manager</h1>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
          style={{ gap: '0.375rem' }}
        >
          <Save size={16} />
          <span>{loading ? 'Saving...' : 'Save Schedule'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem' }} className="avail-grid">
        
        {/* Left column: Active Days Checkbox */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Active Workdays</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {WEEKDAYS.map(day => {
              const isActive = !!schedule[day];
              return (
                <label 
                  key={day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid hsl(var(--border))',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.02)' : 'transparent',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  <span style={{ color: isActive ? 'hsl(var(--secondary))' : 'hsl(var(--text-muted))' }}>{day}</span>
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    onChange={() => handleToggleDay(day)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Right column: Slots modifier */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Configure Time Slots</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select 
                className="form-control"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                style={{ flex: 1, textTransform: 'capitalize', height: '42px' }}
              >
                {WEEKDAYS.map(d => (
                  <option key={d} value={d} disabled={!schedule[d]}>
                    {d} {!schedule[d] ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>

              <input 
                type="time" 
                className="form-control"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                style={{ flex: 1, height: '42px' }}
                disabled={!schedule[selectedDay]}
              />

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleAddSlot}
                disabled={!schedule[selectedDay] || !newSlot}
                style={{ gap: '0.25rem', height: '42px' }}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', textTransform: 'capitalize', color: 'hsl(var(--secondary))' }}>
              Active Slots on {selectedDay}
            </h3>

            {!schedule[selectedDay] || schedule[selectedDay].length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius-sm)', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                No active slots configured for this day. Turn on day checklist or select add slot.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
                {schedule[selectedDay].map(slot => (
                  <div 
                    key={slot}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'hsl(var(--bg-main))',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong>{slot}</strong>
                    <button 
                      type="button"
                      onClick={() => handleRemoveSlot(selectedDay, slot)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .avail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
