import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await api.agents.getAll();
      setAgents(data || []);
    } catch (err) {
      setError('Failed to fetch support agents directory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSpecialty('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setModalMode('edit');
    setSelectedAgent(a);
    setFormName(a.name);
    setFormEmail(a.email);
    setFormPhone(a.phone || '');
    setFormSpecialty(a.specialty || '');
    setFormStatus(a.status);
    setIsModalOpen(true);
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        specialty: formSpecialty,
        status: formStatus
      };

      if (modalMode === 'create') {
        await api.agents.create(payload);
      } else {
        await api.agents.update(selectedAgent._id, payload);
      }

      setIsModalOpen(false);
      fetchAgents();
    } catch (err) {
      alert(err.message || 'Error saving agent record');
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this support agent profile?')) return;
    try {
      await api.agents.delete(id);
      fetchAgents();
    } catch (err) {
      alert('Error deleting agent record');
    }
  };

  return (
    <div>
      <div style={headerSectionStyle}>
        <h2 className="page-title" style={{ margin: 0 }}>Support Agents Directory</h2>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          Recruit Support Agent
        </button>
      </div>

      <div className="glass-container" style={{ padding: '20px' }}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', padding: '20px' }}>{error}</div>
        ) : agents.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Specialty Scope</th>
                  <th>Phone Number</th>
                  <th>Duty Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{a.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.email}</div>
                    </td>
                    <td>{a.specialty || 'General Support'}</td>
                    <td>{a.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${a.status === 'Active' ? 'success' : 'danger'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOpenEdit(a)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#dc2626' }} onClick={() => handleDeleteAgent(a._id)}>
                          Terminate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No agent profiles registered yet. Click Recruit to register one.
          </div>
        )}
      </div>

      {/* Recuit/Edit Agent Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-container modal-content">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              {modalMode === 'create' ? 'Recruit Support Agent' : 'Edit Agent Profile'}
            </h3>
            <form onSubmit={handleSaveAgent}>
              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Priyal Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="e.g. priya.sharma@crm.io"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 017-7788"
                />
              </div>

              <div className="form-group">
                <label>Specialty Scope</label>
                <input
                  type="text"
                  className="form-input"
                  value={formSpecialty}
                  onChange={e => setFormSpecialty(e.target.value)}
                  placeholder="e.g. Technical Support, Billing"
                />
              </div>

              <div className="form-group">
                <label>Duty Status</label>
                <select
                  className="form-input"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const headerSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '20px',
  flexWrap: 'wrap'
};

export default Agents;
