import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Stethoscope, Star, Filter, Heart, Clock } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch doctors and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, deptsRes] = await Promise.all([
          api.doctors.getAll(selectedDept, search),
          api.departments.getAll()
        ]);
        if (docsRes.success) setDoctors(docsRes.data);
        if (deptsRes.success) setDepartments(deptsRes.data);
      } catch (err) {
        console.error('Failed to load doctors catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDept, search]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Our Medical Specialists</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Search by name, specialization, or filter by medical department.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="hsl(var(--text-muted))" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Department:</span>
          </div>
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="form-control"
            style={{ width: '200px', height: '40px' }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
          <div className="skeleton" style={{ width: '250px', height: '1.5rem', margin: '0 auto' }}></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--text-muted))' }}>
          <Stethoscope size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No doctors found matching your query</h3>
          <p style={{ marginTop: '0.5rem' }}>Try refining your search terms or checking a different department.</p>
        </div>
      ) : (
        /* Doctors Grid */
        <div className="grid-cols-3">
          {doctors.map((doc) => (
            <div key={doc.doctor_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Doctor Details */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                  color: 'hsl(var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800
                }}>
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B' }}>
                    <Star size={12} fill="#F59E0B" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-main))' }}>4.8</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem' }}>{doc.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                    {doc.specialization}
                  </p>
                </div>
              </div>

              {/* Stats Block */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                backgroundColor: 'hsl(var(--bg-main))',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Experience</span>
                  <strong>{doc.experience} Years</strong>
                </div>
                <div>
                  <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Consultation Fee</span>
                  <strong style={{ color: 'hsl(var(--success))' }}>₹{doc.consultation_fee}</strong>
                </div>
              </div>

              {/* Availability Schedule Preview */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Clock size={12} />
                  <span>Availability Schedule</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {Object.keys(doc.availability_schedule || {}).map((day, i) => (
                    <span key={i} className="badge badge-pending" style={{ fontSize: '0.65rem', textTransform: 'capitalize', padding: '0.15rem 0.4rem' }}>
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Appointment CTA */}
              <a 
                href="#patient/book-appointment" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                Book Consultation
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
