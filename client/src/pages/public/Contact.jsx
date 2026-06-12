import React, { useState } from 'react';
import { useToast } from '../../context/NotificationContext';
import { MapPin, Phone, Mail, Clock, Send, Heart } from 'lucide-react';

export default function Contact() {
  const addToast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      addToast('Your message has been sent successfully. Our clinical team will reach out shortly.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Page Header */}
      <header className="hero-gradient" style={{ padding: '4rem 2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', marginBottom: '1rem' }}>
          <Heart size={30} fill="white" />
        </div>
        <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>Contact Clinical Care</h1>
        <p className="hero-subtitle" style={{ fontSize: '1.1rem', marginBottom: 0 }}>
          Reach out to our Visakhapatnam center for appointments, medical record queries, or specialized care support.
        </p>
      </header>

      {/* Grid Content */}
      <div className="grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Contact Info Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
              color: 'hsl(var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Hospital Location</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Sacred Heart Medical Center<br />
                12-3-45, Beach Road, Pandurangapuram,<br />
                Visakhapatnam, Andhra Pradesh - 530003
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
              color: 'hsl(var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Phone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Emergency Hotline</h3>
              <p style={{ fontWeight: 700, color: 'hsl(var(--danger))', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                📞 +91 891 234 5678 (24/7 Hotline)
              </p>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                General Queries: +91 891 234 5679
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
              color: 'hsl(var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Electronic Mail</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Appointments: <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>care@sacredheart.com</span><br />
                Administration: <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>admin@sacredheart.com</span>
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
              color: 'hsl(var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Working Hours</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Outpatient Department: 8:00 AM - 8:00 PM (Mon - Sat)<br />
                Emergency & Trauma: 24 Hours / 365 Days
              </p>
            </div>
          </div>

        </div>

        {/* Right: Contact Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Send Us a Message</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Have a question or feedback? Complete the form below, and we will get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter your full name" 
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email address" 
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject</label>
              <input 
                type="text" 
                name="subject"
                placeholder="How can we help you?" 
                value={formData.subject}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Message *</label>
              <textarea 
                name="message"
                placeholder="Write your message details here..." 
                value={formData.message}
                onChange={handleChange}
                className="form-control"
                style={{ minHeight: '120px', resize: 'vertical' }}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ height: '44px', fontWeight: 700, width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Sending...' : (
                <>
                  <Send size={16} />
                  <span>Send Message</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
