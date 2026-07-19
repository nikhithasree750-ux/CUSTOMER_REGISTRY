import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header style={navbarStyle}>
      <h1 style={titleStyle}>{title || 'Customer Registry'}</h1>
      <div style={userSectionStyle}>
        <div style={userInfoStyle}>
          <span style={userNameStyle}>{user?.name || 'Administrator'}</span>
          <span style={userRoleStyle}>{user?.role || 'Manager'}</span>
        </div>
        <img 
          src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
          alt="Avatar" 
          style={avatarStyle} 
        />
      </div>
    </header>
  );
};

const navbarStyle = {
  height: 'var(--header-height)',
  marginLeft: 'var(--sidebar-width)',
  padding: '0 30px',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 90,
  position: 'sticky',
  top: 0
};

const titleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)'
};

const userSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const userInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'right'
};

const userNameStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-primary)'
};

const userRoleStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  fontWeight: '500'
};

const avatarStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '2px solid rgba(99, 102, 241, 0.4)',
  objectFit: 'cover'
};

export default Navbar;
