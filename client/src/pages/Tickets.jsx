import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Detail panel selection
  const [selectedTicket, setSelectedTicket] = useState(null);

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCustId, setFormCustId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formAgentId, setFormAgentId] = useState('');

  // Comment posting
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const ticketsData = await api.tickets.getAll();
      setTickets(ticketsData.tickets || []);

      const agentsData = await api.agents.getAll();
      setAgents(agentsData || []);

      const customersData = await api.customers.getAll({ limit: 100 });
      setCustomers(customersData.customers || []);

      // Refresh detail selection if any
      if (selectedTicket) {
        const freshDetails = (ticketsData.tickets || []).find(t => t._id === selectedTicket._id);
        if (freshDetails) {
          setSelectedTicket(freshDetails);
        }
      }
    } catch (err) {
      setError('Failed to fetch ticket queues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    if (customers.length === 0) {
      alert('Register a customer first before raising support tickets.');
      return;
    }
    setFormCustId(customers[0]._id);
    setFormDesc('');
    setFormPriority('Medium');
    setFormAgentId(agents.length > 0 ? agents[0]._id : '');
    setIsModalOpen(true);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.tickets.create({
        customerId: formCustId,
        description: formDesc,
        priority: formPriority,
        assignedAgentId: formAgentId,
        status: formAgentId ? 'Assigned' : 'Open'
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error creating support ticket');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const timelineEvent = { event: `Status updated to ${status}` };
      const updated = await api.tickets.update(id, {
        status,
        $push: { timeline: timelineEvent }
      });
      setSelectedTicket(updated);
      loadData();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const handleAssignAgent = async (id, agentId) => {
    try {
      const agentName = agents.find(a => a._id === agentId)?.name || 'Agent';
      const updated = await api.tickets.update(id, {
        assignedAgentId: agentId,
        status: 'Assigned',
        $push: {
          timeline: { event: `Assigned to ${agentName}` }
        }
      });
      setSelectedTicket(updated);
      loadData();
    } catch (err) {
      alert('Failed to assign support agent');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const updated = await api.tickets.update(selectedTicket._id, {
        $push: {
          comments: {
            author: user?.name || 'Administrator',
            text: commentText
          }
        }
      });
      setSelectedTicket(updated);
      setCommentText('');
      loadData();
    } catch (err) {
      alert('Failed to post case comment');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this support ticket?')) return;
    try {
      await api.tickets.delete(id);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      alert('Failed to delete support ticket');
    }
  };

  // Filters application
  const filteredTickets = tickets.filter(t => {
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    const statusMatch = statusFilter === 'All' || t.status === statusFilter;
    return priorityMatch && statusMatch;
  });

  return (
    <div>
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
          <select
            className="form-input"
            style={{ maxWidth: '160px', background: '#1e293b', color: '#fff' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="form-input"
            style={{ maxWidth: '180px', background: '#1e293b', color: '#fff' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          File Support Ticket
        </button>
      </div>

      <div style={panelSplitStyle}>
        {/* Tickets queue list */}
        <div className="glass-container" style={{ flex: 1, padding: '20px' }}>
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Agent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => {
                    const custName = customers.find(c => c._id === t.customerId)?.name || 'Unknown Customer';
                    const agentName = agents.find(a => a._id === t.assignedAgentId)?.name || 'Unassigned';
                    return (
                      <tr
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        style={{
                          cursor: 'pointer',
                          background: selectedTicket?._id === t._id ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                        }}
                      >
                        <td style={{ fontWeight: '700' }}>{t.ticketId}</td>
                        <td>{custName}</td>
                        <td>
                          <span className={`badge badge-${
                            t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'info'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '600', 
                            color: t.status === 'Resolved' || t.status === 'Closed' ? 'var(--success)' : 'var(--warning)' 
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: t.assignedAgentId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {agentName}
                        </td>
                        <td>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#dc2626' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteTicket(t._id); }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              No support tickets found matching current priority/status filters.
            </div>
          )}
        </div>

        {/* Ticket timelines & comments sidebar */}
        {selectedTicket && (
          <div className="glass-container" style={detailPanelStyle}>
            <div style={detailHeaderStyle}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700' }}>
                {selectedTicket.ticketId} Details
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {selectedTicket.description}
              </p>
            </div>

            <div style={detailBodyStyle}>
              {/* Assign/Actions menu */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Management Actions</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <select
                    className="form-input"
                    style={{ flex: 1, padding: '8px 12px', background: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                    value={selectedTicket.assignedAgentId || ''}
                    onChange={(e) => handleAssignAgent(selectedTicket._id, e.target.value)}
                  >
                    <option value="">-- Assign Support Agent --</option>
                    {agents.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.specialty})</option>
                    ))}
                  </select>

                  <select
                    className="form-input"
                    style={{ maxWidth: '140px', padding: '8px 12px', background: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Timeline event history */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Timeline Logs</h4>
                <div style={listStyle}>
                  {selectedTicket.timeline && selectedTicket.timeline.length > 0 ? (
                    selectedTicket.timeline.map((event, idx) => (
                      <div key={idx} style={timelineItemStyle}>
                        <div style={timelineDotStyle} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{event.event}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyTextStyle}>No logs recorded</div>
                  )}
                </div>
              </div>

              {/* Comments stream */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Timelines Case Comments</h4>
                <div style={listStyle}>
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((comment, idx) => (
                      <div key={idx} style={listItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {comment.author}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>{comment.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyTextStyle}>No case comments posted</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
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

      {/* Raise Ticket Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-container modal-content">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              File Support Ticket
            </h3>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label>Select Customer Profile</label>
                <select
                  className="form-input"
                  value={formCustId}
                  onChange={e => setFormCustId(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.company || 'Individual'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Trouble Ticket Description</label>
                <textarea
                  className="form-input"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Detail the issue details..."
                  style={{ height: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Severity Level</label>
                <select
                  className="form-input"
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign to Support Agent</label>
                <select
                  className="form-input"
                  value={formAgentId}
                  onChange={e => setFormAgentId(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  <option value="">-- Leave Unassigned --</option>
                  {agents.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.specialty})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  File Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling structures
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

const timelineItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  paddingBottom: '12px',
  borderLeft: '2px solid var(--border-color)',
  paddingLeft: '14px',
  marginLeft: '6px',
  position: 'relative'
};

const timelineDotStyle = {
  position: 'absolute',
  left: '-5px',
  top: '4px',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--primary)',
  boxShadow: '0 0 0 4px var(--bg-primary)'
};

const emptyTextStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '12px 0'
};

export default Tickets;
