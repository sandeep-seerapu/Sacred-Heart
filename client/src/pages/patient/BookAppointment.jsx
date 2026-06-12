import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { Landmark, Stethoscope, Clock, FileText, CheckCircle, CalendarRange } from 'lucide-react';

export default function BookAppointment() {
  const { user } = useAuth();
  const addToast = useToast();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Booking details
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');

  // Available slots for selected doctor
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);

  // Load Departments & Doctors Catalog
  useEffect(() => {
    const initData = async () => {
      try {
        const [deptsRes, docsRes] = await Promise.all([
          api.departments.getAll(),
          api.doctors.getAll()
        ]);
        if (deptsRes.success) setDepartments(deptsRes.data);
        if (docsRes.success) setDoctors(docsRes.data);
      } catch (err) {
        addToast('Failed to initialize booking catalog.', 'error');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // When date changes, calculate available slots for selected doctor
  useEffect(() => {
    if (!selectedDoctor || !bookingDate) return;

    const calculateSlots = async () => {
      try {
        // Fetch all appointments to check for collisions
        const apptsRes = await api.appointments.getAll();
        const dateObj = new Date(bookingDate);
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = weekdays[dateObj.getDay()];

        // Get doctor's default availability slots for this day
        const sched = selectedDoctor.availability_schedule || {};
        const baseSlots = sched[dayOfWeek] || [];

        if (baseSlots.length === 0) {
          setAvailableSlots([]);
          addToast(`Doctor is not scheduled to consult on ${dayOfWeek}s.`, 'warning');
          return;
        }

        // Filter out slots that are already booked
        const bookedSlots = (apptsRes.data || [])
          .filter(a => a.doctor_id === selectedDoctor.doctor_id && a.appointment_date === bookingDate && a.status !== 'Cancelled')
          .map(a => a.appointment_time.substring(0, 5)); // format to HH:MM

        const freeSlots = baseSlots.filter(slot => !bookedSlots.includes(slot));
        setAvailableSlots(freeSlots);
      } catch (err) {
        console.error('Failed to calculate available slots:', err);
      }
    };

    calculateSlots();
  }, [bookingDate, selectedDoctor]);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setStep(2);
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!bookingDate || !bookingTime) {
      addToast('Please select a date and time slot.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.appointments.book(selectedDoctor.doctor_id, bookingDate, bookingTime, notes);
      if (res.success) {
        addToast('Appointment booked! Waiting for Doctor approval.', 'success');
        setStep(4);
      }
    } catch (err) {
      addToast(err.message || 'Failed to book slot. Check slot availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = selectedDept 
    ? doctors.filter(d => d.department_id === selectedDept.department_id)
    : doctors;

  if (loading && step === 1) {
    return <div className="skeleton" style={{ height: '300px' }}></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <CalendarRange size={28} color="hsl(var(--primary))" />
        <h1 style={{ fontSize: '1.75rem' }}>Book Medical Appointment</h1>
      </div>

      {/* Progress Tracker */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>
        <span style={{ color: step >= 1 ? 'hsl(var(--primary))' : '' }}>1. Department</span>
        <span>&rarr;</span>
        <span style={{ color: step >= 2 ? 'hsl(var(--primary))' : '' }}>2. Specialist</span>
        <span>&rarr;</span>
        <span style={{ color: step >= 3 ? 'hsl(var(--primary))' : '' }}>3. Time Slot</span>
        <span>&rarr;</span>
        <span style={{ color: step >= 4 ? 'hsl(var(--primary))' : '' }}>4. Finished</span>
      </div>

      {/* WIZARD CONTAINER */}
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* STEP 1: SELECT DEPARTMENT */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Select Hospital Department</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments.map((dept) => (
                <div 
                  key={dept.department_id}
                  className="card"
                  onClick={() => handleSelectDept(dept)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'rgba(var(--primary-rgb), 0.02)'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'hsl(var(--primary))' }}>{dept.department_name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>{dept.description}</p>
                  </div>
                  <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                    {dept.doctor_count} Specialists
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DOCTOR */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Specialists in {selectedDept.department_name}</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>&larr; Back</button>
            </div>

            {filteredDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Stethoscope size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>No specialists currently registered in this department.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredDoctors.map((doc) => (
                  <div 
                    key={doc.doctor_id}
                    className="card"
                    onClick={() => handleSelectDoctor(doc)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem 1.5rem'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{doc.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{doc.specialization} ({doc.experience} yrs exp)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--success))' }}>₹{doc.consultation_fee}</div>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Consult Fee</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DATE & TIME SLOTS */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Consultation Date & Time</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}>&larr; Back</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Doctor Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'hsl(var(--bg-main))', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {selectedDoctor.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <strong>{selectedDoctor.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Fee: ₹{selectedDoctor.consultation_fee}</div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingTime(''); // reset time
                  }}
                  min={new Date().toISOString().split('T')[0]} // limit past dates
                  required
                />
              </div>

              {/* Time Slots Selection */}
              {bookingDate && (
                <div>
                  <label className="form-label" style={{ marginBottom: '0.75rem' }}>Available Time Slots</label>
                  {availableSlots.length === 0 ? (
                    <div style={{
                      padding: '1.5rem',
                      border: '1px dashed hsl(var(--danger))',
                      color: 'hsl(var(--danger))',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}>
                      No slots available for this date. Check another weekday or date.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                      {availableSlots.map((slot) => {
                        const isSelected = bookingTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            className="btn"
                            onClick={() => setBookingTime(slot)}
                            style={{
                              backgroundColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--bg-main))',
                              color: isSelected ? 'white' : 'hsl(var(--text-main))',
                              fontSize: '0.8rem',
                              padding: '0.5rem',
                              border: isSelected ? 'none' : '1px solid hsl(var(--border))'
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Appointment Notes */}
              <div className="form-group">
                <label className="form-label">Symptoms / Notes (Optional)</label>
                <textarea 
                  rows="3" 
                  className="form-control"
                  placeholder="Describe your symptoms briefly..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', fontWeight: 700 }}
                onClick={handleConfirmBooking}
                disabled={!bookingDate || !bookingTime || loading}
              >
                {loading ? 'Booking Slot...' : 'Confirm and Submit Booking'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMED */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'hsl(var(--success))', marginBottom: '1.5rem' }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Appointment Successfully Scheduled!</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Your appointment request with <strong>{selectedDoctor.name}</strong> on <strong>{bookingDate}</strong> at <strong>{bookingTime}</strong> is pending review.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <a href="#patient/appointments" className="btn btn-primary">My Appointments</a>
              <button className="btn btn-outline" onClick={() => {
                setStep(1);
                setSelectedDept(null);
                setSelectedDoctor(null);
                setBookingDate('');
                setBookingTime('');
                setNotes('');
              }}>Book Another</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
