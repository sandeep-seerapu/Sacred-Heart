import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'hsl(var(--bg-card))',
      borderTop: '1px solid hsl(var(--border))',
      padding: '3rem 2rem',
      marginTop: 'auto',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: 'hsl(var(--text-muted))'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '2rem' }}>
        <div>
          <h4 style={{ color: 'hsl(var(--primary))', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} fill="hsl(var(--primary))" />
            <span>Sacred Heart Medical Center</span>
          </h4>
          <p style={{ lineHeight: '1.6' }}>
            Leading healthcare provider delivering world-class clinical precision combined with compassionate pediatric, orthopedic, and cardiovascular services.
          </p>
        </div>
        <div>
          <h4 style={{ color: 'hsl(var(--text-main))', marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="#home" style={{ hoverColor: 'hsl(var(--primary))' }}>Home Page</a></li>
            <li><a href="#doctors" style={{ hoverColor: 'hsl(var(--primary))' }}>Our Specialists</a></li>
            <li><a href="#about" style={{ hoverColor: 'hsl(var(--primary))' }}>About EMR</a></li>
            <li><a href="#contact" style={{ hoverColor: 'hsl(var(--primary))' }}>Contact Care</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'hsl(var(--text-main))', marginBottom: '1rem' }}>Emergency Contact</h4>
          <p style={{ fontWeight: 600, color: 'hsl(var(--danger))', fontSize: '1rem', marginBottom: '0.5rem' }}>
            📞 24/7 Hotline: +91 891 234 5678
          </p>
          <p style={{ lineHeight: '1.5' }}>
            Emergency Unit:<br />
            12-3-45, Beach Road, Pandurangapuram,<br />
            Visakhapatnam, Andhra Pradesh - 530003
          </p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem' }}>
        <p>&copy; {new Date().getFullYear()} Sacred Heart EMR. All Rights Reserved. Built with ❤️ for professional clinical care.</p>
      </div>
    </footer>
  );
}
