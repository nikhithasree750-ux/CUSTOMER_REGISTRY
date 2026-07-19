import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit Feedback Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCustId, setFormCustId] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const fbData = await api.feedbacks.getAll();
      setFeedbacks(fbData || []);

      const customersData = await api.customers.getAll({ limit: 100 });
      setCustomers(customersData.customers || []);

      if (customersData.customers && customersData.customers.length > 0) {
        setFormCustId(customersData.customers[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch reviews and customer feedbacks');
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
      alert('Register a customer before submitting feedback logs.');
      return;
    }
    setFormCustId(customers[0]._id);
    setFormRating(5);
    setFormComment('');
    setIsModalOpen(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.feedbacks.create({
        customerId: formCustId,
        rating: Number(formRating),
        comment: formComment
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to log customer feedback');
    }
  };

  return (
    <div>
      <div style={headerSectionStyle}>
        <h2 className="page-title" style={{ margin: 0 }}>Customer Feedback Reviews</h2>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          Log Feedback
        </button>
      </div>

      <div className="glass-container" style={{ padding: '24px' }}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', padding: '20px' }}>{error}</div>
        ) : feedbacks.length > 0 ? (
          <div style={feedbackGridStyle}>
            {feedbacks.map(fb => {
              const custName = customers.find(c => c._id === fb.customerId)?.name || 'Anonymous Customer';
              const ratingStars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
              return (
                <div key={fb._id} style={fbCardStyle}>
                  <div style={fbHeaderStyle}>
                    <div style={fbUserStyle}>
                      <span style={{ fontWeight: '600' }}>{custName}</span>
                    </div>
                    <span style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '1.1rem' }}>
                      {ratingStars}
                    </span>
                  </div>
                  <p style={fbCommentStyle}>
                    "{fb.comment || 'No comment provided'}"
                  </p>
                  <div style={fbDateStyle}>
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No customer feedbacks logged yet. Click Log Feedback to write one.
          </div>
        )}
      </div>

      {/* Log Feedback Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-container modal-content">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              Log Customer Feedback
            </h3>
            <form onSubmit={handleSubmitFeedback}>
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
                <label>Star Rating (1 to 5 Stars)</label>
                <select
                  className="form-input"
                  value={formRating}
                  onChange={e => setFormRating(e.target.value)}
                  style={{ background: '#1e293b', color: '#fff' }}
                >
                  <option value="5">★★★★★ (5 Stars - Outstanding)</option>
                  <option value="4">★★★★☆ (4 Stars - Excellent)</option>
                  <option value="3">★★★☆☆ (3 Stars - Satisfactory)</option>
                  <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
                  <option value="1">★☆☆☆☆ (1 Star - Bad)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Comment / Review Text</label>
                <textarea
                  className="form-input"
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  placeholder="Record customer's remarks..."
                  style={{ height: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Review
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

const feedbackGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px'
};

const fbCardStyle = {
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const fbHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const fbUserStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const fbCommentStyle = {
  fontSize: '0.92rem',
  color: 'var(--text-primary)',
  lineHeight: '1.5',
  fontStyle: 'italic',
  flex: 1
};

const fbDateStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textAlign: 'right'
};

export default Feedbacks;
