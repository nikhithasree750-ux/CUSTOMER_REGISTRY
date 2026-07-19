import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await api.customers.getStats();
        setStats(statsData);

        // Fetch recent tickets to show activities
        const ticketsData = await api.tickets.getAll();
        const recentTickets = ticketsData.tickets || [];
        const mappedActivities = recentTickets.slice(-3).map(t => ({
          id: t._id,
          text: `Ticket ${t.ticketId}: ${t.description.slice(0, 45)}...`,
          type: t.priority === 'Critical' ? 'danger' : 'info',
          time: new Date(t.createdAt).toLocaleDateString()
        }));
        setActivities(mappedActivities.reverse());
      } catch (err) {
        setError('Failed to load dashboard metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'var(--danger)', padding: '20px' }}>{error}</div>;
  }

  const { counts, ltv, ticketStats, monthlyTrends = [] } = stats || {};

  // Find max value in monthly trends for chart scaling
  const maxRegs = Math.max(...monthlyTrends.map(t => t.registrations), 1);
  const maxRevenue = Math.max(...monthlyTrends.map(t => t.revenue), 1);

  return (
    <div>
      <div className="metrics-grid">
        <div className="glass-container metric-card">
          <div className="metric-title">Total Customers</div>
          <div className="metric-value">{counts?.total || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>
            Active: {counts?.active || 0}
          </div>
        </div>

        <div className="glass-container metric-card">
          <div className="metric-title">LTV Portfolio</div>
          <div className="metric-value" style={{ color: 'var(--info)' }}>
            ${(ltv?.total || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Max LTV: ${(ltv?.maximum || 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-container metric-card">
          <div className="metric-title">Support Tickets</div>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>
            {ticketStats?.pending || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px' }}>
            Critical: {ticketStats?.critical || 0} | Overdue: {ticketStats?.overdue || 0}
          </div>
        </div>

        <div className="glass-container metric-card">
          <div className="metric-title">Customer Satisfaction</div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>
            {ticketStats?.avgRating || 4.8} / 5.0
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Based on submitted reviews
          </div>
        </div>
      </div>

      {/* Charts section with custom premium inline vectors */}
      <div style={chartSectionStyle}>
        <div className="glass-container" style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Monthly Registrations Trend</h3>
          <div style={chartContainerStyle}>
            {monthlyTrends.map((t, idx) => {
              const heightPct = (t.registrations / maxRegs) * 75 + 10;
              return (
                <div key={idx} style={barWrapperStyle}>
                  <div style={barTooltipStyle}>{t.registrations} signups</div>
                  <div style={{ ...barStyle, height: `${heightPct}%`, background: 'linear-gradient(to top, var(--primary), #a5b4fc)' }} />
                  <span style={barLabelStyle}>{t.month.split('-')[1]}/{t.month.split('-')[0].slice(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-container" style={chartCardStyle}>
          <h3 style={chartTitleStyle}>LTV Revenue Added ($)</h3>
          <div style={chartContainerStyle}>
            {monthlyTrends.map((t, idx) => {
              const heightPct = (t.revenue / maxRevenue) * 75 + 10;
              return (
                <div key={idx} style={barWrapperStyle}>
                  <div style={barTooltipStyle}>${t.revenue.toLocaleString()}</div>
                  <div style={{ ...barStyle, height: `${heightPct}%`, background: 'linear-gradient(to top, var(--info), #22d3ee)' }} />
                  <span style={barLabelStyle}>{t.month.split('-')[1]}/{t.month.split('-')[0].slice(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities Panel */}
      <div className="glass-container" style={{ marginTop: '30px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
          Recent System Activities
        </h3>
        <div style={activityListStyle}>
          {activities.length > 0 ? (
            activities.map(act => (
              <div key={act.id} style={activityItemStyle}>
                <div style={{ 
                  ...activityIndicatorStyle, 
                  background: act.type === 'danger' ? 'var(--danger)' : 'var(--info)' 
                }} />
                <div style={activityTextStyle}>{act.text}</div>
                <div style={activityTimeStyle}>{act.time}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent system logs available</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom dashboard layouts
const chartSectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '20px',
  marginTop: '30px'
};

const chartCardStyle = {
  minHeight: '280px',
  display: 'flex',
  flexDirection: 'column'
};

const chartTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  marginBottom: '20px'
};

const chartContainerStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-around',
  paddingTop: '20px',
  height: '180px',
  borderBottom: '1px solid var(--border-color)'
};

const barWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  width: '12%',
  position: 'relative',
  cursor: 'pointer'
};

const barStyle = {
  width: '70%',
  borderRadius: '6px 6px 0 0',
  transition: 'height 0.5s ease'
};

const barLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '8px'
};

const barTooltipStyle = {
  position: 'absolute',
  top: '-15px',
  background: '#1e293b',
  color: '#fff',
  padding: '2px 6px',
  fontSize: '0.7rem',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  whiteSpace: 'nowrap',
  pointerEvents: 'none'
};

// Enable tooltip hover styling via CSS inject or simply state inline mouse actions
// (We will handle standard css class in index.css if needed, or inline tooltips look clean anyway)

const activityListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const activityItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.03)'
};

const activityIndicatorStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%'
};

const activityTextStyle = {
  flex: 1,
  fontSize: '0.9rem',
  color: 'var(--text-primary)'
};

const activityTimeStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)'
};

export default Dashboard;
