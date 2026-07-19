import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortFilter, setSortFilter] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection detail
  const [selectedCust, setSelectedCust] = useState(null);
  
  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formStatus, setFormStatus] = useState('Lead');
  const [formLtv, setFormLtv] = useState('0');
  const [formNotes, setFormNotes] = useState('');
  
  // Internal Note form
  const [noteText, setNoteText] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.customers.getAll({
        search,
        status: statusFilter,
        sort: sortFilter,
        page,
        limit: 8
      });
      setCustomers(data.customers || []);
      setPagination(data.pagination || {});
      
      // If we have a selected customer, refresh their details
      if (selectedCust) {
        const freshDetails = (data.customers || []).find(c => c._id === selectedCust._id);
        if (freshDetails) {
          setSelectedCust(freshDetails);
        } else {
          // fetch from detail API or keep old
          const freshCust = await api.customers.getAll({ search: selectedCust.email });
          if (freshCust.customers && freshCust.customers.length > 0) {
            setSelectedCust(freshCust.customers[0]);
          }
        }
      }
    } catch (err) {
      setError('Error retrieving customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, sortFilter, page]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormStatus('Lead');
    setFormLtv('0');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setModalMode('edit');
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone || '');
    setFormCompany(cust.company || '');
    setFormStatus(cust.status);
    setFormLtv(String(cust.ltv || 0));
    setFormNotes(cust.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        company: formCompany,
        status: formStatus,
        ltv: Number(formLtv),
        notes: formNotes
      };

      if (modalMode === 'create') {
        await api.customers.create(payload);
      } else {
        await api.customers.update(selectedCust._id, payload);
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to save customer data');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to remove this customer account?')) return;
    try {
      await api.customers.delete(id);
      setSelectedCust(null);
      fetchCustomers();
    } catch (err) {
      alert('Error deleting customer account');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const updated = await api.customers.update(selectedCust._id, {
        $push: {
          notesList: {
            author: user?.name || 'Administrator',
            text: noteText
          }
        }
      });
      setSelectedCust(updated);
      setNoteText('');
      fetchCustomers();
    } catch (err) {
      alert('Failed to log note');
    }
  };

  return (
    <div>
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '280px' }}
            placeholder="Search name, email, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          <select
            className="form-input"
            style={{ maxWidth: '160px', background: '#1e293b', color: '#fff' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Lead">Lead</option>
          </select>

          <select
            className="form-input"
            style={{ maxWidth: '180px', background: '#1e293b', color: '#fff' }}
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="newest">Newest Account</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="ltv-high">Highest LTV</option>
            <option value="ltv-low">Lowest LTV</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          Register Customer
        </button>
      </div>

      <div style={panelSplitStyle}>
        {/* Customer list panel */}
        <div className="glass-container" style={{ flex: 1, padding: '20px' }}>
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
          ) : customers.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>LTV</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(cust => (
                      <tr 
                        key={cust._id} 
                        onClick={() => setSelectedCust(cust)}
                        style={{ 
                          cursor: 'pointer', 
                          background: selectedCust?._id === cust._id ? 'rgba(99, 102, 241, 0.08)' : 'transparent' 
                        }}
                      >
                        <td>
                          <div style={{ fontWeight: '600' }}>{cust.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cust.email}</div>
                        </td>
                        <td>{cust.company || 'Individual'}</td>
                        <td style={{ fontWeight: '600' }}>${(cust.ltv || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${
                            cust.status === 'Active' ? 'success' : cust.status === 'Lead' ? 'warning' : 'danger'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOpenEdit(cust)}>
                              Edit
                            </button>
                            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#dc2626' }} onClick={() => handleDeleteCustomer(cust._id)}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls */}
              <div style={paginationContainerStyle}>
                <button 
                  className="btn btn-secondary" 
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Page {pagination.page} of {pagination.pages || 1}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              No customer records found matching the search parameters.
            </div>
          )}
        </div>

        {/* Note-taking/detail sidebar panel */}
        {selectedCust && (
          <div className="glass-container" style={detailPanelStyle}>
            <div style={detailHeaderStyle}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700' }}>
                {selectedCust.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {selectedCust._id}</p>
            </div>

            <div style={detailBodyStyle}>
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Customer Dossier</h4>
                <p><strong>Email:</strong> {selectedCust.email}</p>
                <p><strong>Phone:</strong> {selectedCust.phone || 'N/A'}</p>
                <p><strong>Company:</strong> {selectedCust.company || 'N/A'}</p>
                <p><strong>Internal notes:</strong> {selectedCust.notes || 'None'}</p>
              </div>

              {/* Interactions list */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Interactions History</h4>
                <div style={listStyle}>
                  {selectedCust.interactions && selectedCust.interactions.length > 0 ? (
                    selectedCust.interactions.map(item => (
                      <div key={item.id} style={listItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{item.type}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>{item.summary}</div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyTextStyle}>No logged interactions</div>
                  )}
                </div>
              </div>

              {/* Internal agent notes list */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Agent Case Notes</h4>
                <div style={listStyle}>
                  {selectedCust.notesList && selectedCust.notesList.length > 0 ? (
                    selectedCust.notesList.map(note => (
                      <div key={note.id} style={listItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {note.author}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{note.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyTextStyle}>No agent notes submitted</div>
                  )}
                </div>

                {/* Add note form */}
                <form onSubmit={handleAddNote} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Log agent case notes..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Create/Edit Popup Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-container modal-content">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              {modalMode === 'create' ? 'Register Customer' : 'Edit Customer Profile'}
            </h3>
            <form onSubmit={handleSaveCustomer}>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
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
                  placeholder="e.g. sarah@cyberdyne.io"
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
                  placeholder="e.g. +1 (555) 019-9281"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  className="form-input"
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  placeholder="e.g. Cyberdyne Systems"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-input"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>LTV Portfolio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formLtv}
                  onChange={e => setFormLtv(e.target.value)}
                  placeholder="LTV Value"
                />
              </div>

              <div className="form-group">
                <label>Internal Notes</label>
                <textarea
                  className="form-input"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Additional dossier details..."
                  style={{ height: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
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

const panelSplitStyle = {
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
  flexWrap: 'wrap'
};

const paginationContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '20px'
};

const detailPanelStyle = {
  width: '380px',
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column'
};

const detailHeaderStyle = {
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '14px',
  marginBottom: '16px'
};

const detailBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '0.85rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: '8px'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '180px',
  overflowY: 'auto',
  paddingRight: '4px'
};

const listItemStyle = {
  padding: '8px 12px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px'
};

const emptyTextStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '12px 0'
};

export default Customers;
