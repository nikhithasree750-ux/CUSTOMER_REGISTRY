import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Agent');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({ name, email, password, phone, role });
      setSuccess('Account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/CUSTOMER_REGISTRY/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div className="glass-container" style={cardStyle}>
        <div style={headerStyle}>
          <h2 className="glow-text" style={titleStyle}>Join Console</h2>
          <p style={subtitleStyle}>Register Customer Registry Account</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. agent@crm.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 012-3456"
            />
          </div>

          <div className="form-group">
            <label>Access Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={selectStyle}
            >
              <option value="Agent">Support Agent</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={submitButtonStyle}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div style={footerLinkStyle}>
          Already have an account? <Link to="/CUSTOMER_REGISTRY/login" style={linkStyle}>Sign In here</Link>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 60%), radial-gradient(circle at bottom left, rgba(165, 180, 252, 0.05), transparent 50%), var(--bg-primary)'
};

const cardStyle = {
  width: '100%',
  maxWidth: '450px',
  margin: '20px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '28px'
};

const titleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '2rem',
  fontWeight: '800',
  marginBottom: '6px'
};

const subtitleStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)'
};

const errorStyle = {
  padding: '12px',
  background: 'var(--danger-glow)',
  border: '1px solid var(--danger)',
  borderRadius: '8px',
  color: 'var(--danger)',
  fontSize: '0.85rem',
  marginBottom: '20px',
  textAlign: 'center',
  fontWeight: '500'
};

const successStyle = {
  padding: '12px',
  background: 'var(--success-glow)',
  border: '1px solid var(--success)',
  borderRadius: '8px',
  color: 'var(--success)',
  fontSize: '0.85rem',
  marginBottom: '20px',
  textAlign: 'center',
  fontWeight: '500'
};

const submitButtonStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '12px'
};

const selectStyle = {
  color: 'var(--text-primary)',
  background: '#1e293b'
};

const footerLinkStyle = {
  marginTop: '24px',
  textAlign: 'center',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)'
};

const linkStyle = {
  color: 'var(--primary)',
  textDecoration: 'none',
  fontWeight: '600'
};

export default Register;
