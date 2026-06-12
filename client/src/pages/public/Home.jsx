import React from 'react';
import { ShieldCheck, HeartPulse, BrainCircuit, Activity, Star } from 'lucide-react';

export default function Home() {
  const departments = [
    { name: 'Cardiology', icon: <HeartPulse size={28} />, desc: 'Specialized heart diagnostics, surgeries, and hypertension management.' },
    { name: 'Neurology', icon: <BrainCircuit size={28} />, desc: 'Diagnosis and clinical therapy of brain, nerve, and spinal conditions.' },
    { name: 'Orthopedics', icon: <Activity size={28} />, desc: 'Bones, muscles, and joints treatment featuring high-precision surgeries.' },
  ];

  const doctors = [
    { name: 'Dr. Arjun Mehta', specialty: 'Diagnostic Neurology', experience: 20, fee: '₹250', rating: 4.9 },
    { name: 'Dr. Priya Sharma', specialty: 'Interventional Cardiology', experience: 12, fee: '₹150', rating: 4.8 },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Hero Header */}
      <header className="hero-gradient">
        <h1 className="hero-title">Your Health, Guided by Precision</h1>
        <p className="hero-subtitle">
          Sacred Heart EMR provides a secure, digital hospital platform connecting patient appointments, diagnoses, and instant prescription management.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="#register" className="btn" style={{ backgroundColor: 'white', color: 'hsl(var(--primary))' }}>
            Book Appointment
          </a>
          <a href="#doctors" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
            Meet Specialists
          </a>
        </div>
      </header>

      {/* Stats Board */}
      <section className="stats-container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div>
            <div className="stat-value">5+</div>
            <div className="stat-label">Specialist Depts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div>
            <div className="stat-value">25+</div>
            <div className="stat-label">Expert Doctors</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">12K+</div>
            <div className="stat-label">Patients Served</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">15+</div>
            <div className="stat-label">Years of Service</div>
          </div>
        </div>
      </section>

      {/* Featured Departments */}
      <section style={{ margin: '5rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2rem' }}>Featured Medical Departments</h2>
        <div className="grid-cols-3">
          {departments.map((dept, index) => (
            <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {dept.icon}
              </div>
              <h3>{dept.name}</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', flexGrow: 1 }}>{dept.desc}</p>
              <a href={`#doctors?dept=${dept.name}`} style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                View Doctors &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'hsl(var(--bg-card))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))', margin: '5rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>How EMR Scheduling Works</h2>
        <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', marginBottom: '3rem' }}>Get treated in 3 easy steps</p>
        <div className="step-container">
          <div className="step-item">
            <div className="step-num">1</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Create EMR Profile</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Sign up as a patient and register your medical history details.</p>
          </div>
          <div className="step-item">
            <div className="step-num">2</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Schedule Slot</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Select a specialized department, choose your doctor, and lock a calendar slot.</p>
          </div>
          <div className="step-item">
            <div className="step-num">3</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Receive Care & Prescription</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Consult the physician, receive diagnosis notes, and download prescriptions as PDF.</p>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section style={{ margin: '5rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2rem' }}>Meet Our Top Specialists</h2>
        <div className="grid-cols-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {doctors.map((doc, index) => (
            <div key={index} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {doc.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', marginBottom: '0.25rem' }}>
                  <Star size={14} fill="#F59E0B" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--text-main))' }}>{doc.rating}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{doc.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', margin: '0.1rem 0' }}>{doc.specialty}</p>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  Consultation: <span style={{ color: 'hsl(var(--primary))' }}>{doc.fee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ margin: '5rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>Patient Testimonials</h2>
        <div className="grid-cols-2" style={{ maxWidth: '900px', margin: '0 auto', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontStyle: 'italic', position: 'relative' }}>
            <p style={{ color: 'hsl(var(--text-muted))', lineHeight: '1.6' }}>
              "The EMR scheduling system is incredibly smooth. I booked my cardiac consultation, received automated confirmation, and downloaded my prescription directly from the patient portal."
            </p>
            <div style={{ fontStyle: 'normal', fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>
              — Anjali Krishnan, Cardiology Patient
            </div>
          </div>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontStyle: 'italic', position: 'relative' }}>
            <p style={{ color: 'hsl(var(--text-muted))', lineHeight: '1.6' }}>
              "Sacred Heart made child consultation easy. I was able to select pediatric slots without waiting, and Dr. Mehta's diagnosis was instantly logged. Highly recommended!"
            </p>
            <div style={{ fontStyle: 'normal', fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>
              — Vikram Nair, Pediatric Patient's Parent
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
