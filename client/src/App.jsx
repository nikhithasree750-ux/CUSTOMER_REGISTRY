import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Import CSS Stylesheet
import './styles/theme.css';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Tickets from './pages/Tickets';
import Agents from './pages/Agents';
import Feedbacks from './pages/Feedbacks';

// PrivateRoute Wrapper for routing guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/CUSTOMER_REGISTRY/login" replace />;
};

// Route wrapper to handle custom layout structures
const LayoutContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname.replace(/\/$/, '');
    if (path === '/CUSTOMER_REGISTRY') return 'Dashboard Control';
    if (path.startsWith('/CUSTOMER_REGISTRY/customers')) return 'Customers Dossier';
    if (path.startsWith('/CUSTOMER_REGISTRY/tickets')) return 'Trouble Tickets Operations';
    if (path.startsWith('/CUSTOMER_REGISTRY/agents')) return 'Support Agents Directory';
    if (path.startsWith('/CUSTOMER_REGISTRY/feedbacks')) return 'Client Feedbacks Ratings';
    return 'Customer Registry';
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/CUSTOMER_REGISTRY/login" element={<Login />} />
        <Route path="/CUSTOMER_REGISTRY/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/CUSTOMER_REGISTRY/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title={getPageTitle()} />
        <main className="main-content">
          <Routes>
            <Route path="/CUSTOMER_REGISTRY/" element={<Dashboard />} />
            <Route path="/CUSTOMER_REGISTRY/customers" element={<Customers />} />
            <Route path="/CUSTOMER_REGISTRY/tickets" element={<Tickets />} />
            <Route path="/CUSTOMER_REGISTRY/agents" element={<Agents />} />
            <Route path="/CUSTOMER_REGISTRY/feedbacks" element={<Feedbacks />} />
            <Route path="*" element={<Navigate to="/CUSTOMER_REGISTRY/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
