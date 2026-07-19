import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const links = [
    {
      to: '/CUSTOMER_REGISTRY/',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      to: '/CUSTOMER_REGISTRY/customers',
      label: 'Customers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      to: '/CUSTOMER_REGISTRY/tickets',
      label: 'Support Tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      to: '/CUSTOMER_REGISTRY/agents',
      label: 'Agents',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      to: '/CUSTOMER_REGISTRY/feedbacks',
      label: 'Feedback',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    }
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainerStyle}>
        <div style={logoIconStyle}>CR</div>
        <span style={logoTextStyle}>Customer Registry</span>
      </div>
      <nav style={navStyle}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/CUSTOMER_REGISTRY/'}
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeLinkStyle : {})
            })}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={footerStyle}>
        <button onClick={logout} style={logoutButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

// Inline CSS for Layout components
const sidebarStyle = {
  width: 'var(--sidebar-width)',
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  background: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100
};

const logoContainerStyle = {
  height: 'var(--header-height)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  gap: '12px',
  borderBottom: '1px solid var(--border-color)'
};

const logoIconStyle = {
  width: '32px',
  height: '32px',
  background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
  color: '#fff',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.9rem'
};

const logoTextStyle = {
  fontFamily: 'var(--font-heading)',
  fontWeight: '700',
  fontSize: '1.1rem',
  color: 'var(--text-primary)'
};

const navStyle = {
  flex: 1,
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: '500',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease'
};

const activeLinkStyle = {
  background: 'rgba(99, 102, 241, 0.1)',
  color: 'var(--primary)',
  fontWeight: '600'
};

const footerStyle = {
  padding: '24px 16px',
  borderTop: '1px solid var(--border-color)'
};

const logoutButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: 'var(--danger)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  fontWeight: '500',
  textAlign: 'left',
  transition: 'background 0.2s ease'
};

export default Sidebar;
