import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/CUSTOMER_REGISTRY/');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div className="glass-container" style={cardStyle}>
        <div style={headerStyle}>
          <h2 className="glow-text" style={titleStyle}>Customer Registry</h2>
          <p style={subtitleStyle}>Control Console Login</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@crm.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={submitButtonStyle}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={footerLinkStyle}>
          Don't have an account? <Link to="/CUSTOMER_REGISTRY/register" style={linkStyle}>Register here</Link>
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
  maxWidth: '420px',
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

const submitButtonStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '12px'
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

export default Login;
