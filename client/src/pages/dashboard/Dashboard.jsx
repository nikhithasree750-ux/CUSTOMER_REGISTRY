import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Ticket, CheckCircle, AlertOctagon, Star, 
  TrendingUp, Activity, Bell, Calendar, ArrowRight, Clock, ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#eab308', '#22c55e', '#ef4444', '#64748b'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [agentWorkloads, setAgentWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsData = await api.getStats();
      setStats(statsData);

      // Load activities timeline
      const activitiesData = await api.getActivities();
      setActivities(activitiesData.slice(0, 5) || []); // show top 5

      // Load agents and compute workloads for chart
      const agents = await api.getAgents();
      const ticketsData = await api.getTickets();
      const allTickets = ticketsData.tickets || [];
      
      const workloads = agents.map(agent => {
        const count = allTickets.filter(t => 
          t.assignedAgentId === agent._id && 
          (t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress')
        ).length;
        return { name: agent.name.split(' ')[0], tickets: count };
      });
      setAgentWorkloads(workloads);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse font-sans">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-805 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-805 rounded-3xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-805 rounded-3xl" />
        </div>
      </div>
    );
  }

  const counts = stats?.counts || { total: 0, active: 0, inactive: 0, lead: 0 };
  const ticketStats = stats?.ticketStats || { total: 0, open: 0, resolved: 0, closed: 0, pending: 0, critical: 0, overdue: 0, avgRating: 4.8 };
  const monthlyTrends = stats?.monthlyTrends || [];

  const cards = [
    {
      title: 'Total Customers',
      value: counts.total,
      indicator: '▲ 12%',
      indicatorUp: true,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
      badge: 'Registrations growth'
    },
    {
      title: 'Open Tickets',
      value: ticketStats.pending,
      indicator: `${ticketStats.open} unassigned`,
      indicatorUp: false,
      icon: Ticket,
      color: 'from-amber-500 to-amber-600 shadow-amber-500/25',
      badge: 'Active support queue'
    },
    {
      title: 'Resolved Tickets',
      value: ticketStats.resolved + ticketStats.closed,
      indicator: 'SLA Met',
      indicatorUp: true,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
      badge: 'Closed support queue'
    },
    {
      title: 'Critical SLA Alerts',
      value: ticketStats.critical,
      indicator: `${ticketStats.overdue} Overdue`,
      indicatorUp: false,
      isDanger: ticketStats.critical > 0 || ticketStats.overdue > 0,
      icon: AlertOctagon,
      color: ticketStats.critical > 0 ? 'from-rose-500 to-rose-600 shadow-rose-500/25 animate-pulse' : 'from-slate-500 to-slate-600 shadow-slate-500/25',
      badge: 'Emergency follow-ups'
    }
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">
      
      {/* Alert Overdue Banner */}
      {ticketStats.overdue > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-bold shadow-sm shadow-rose-500/5 animate-pulse">
          <AlertOctagon size={18} className="shrink-0" />
          <span>SLA Breach Warning: {ticketStats.overdue} support tickets have exceeded their response deadline targets! Please re-balance agent workloads.</span>
        </div>
      )}

      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            SalesFlow Operations Control
          </h2>
          <p className="text-slate-400 text-xs max-w-md leading-relaxed">
            Welcome back, <strong>{user?.name || 'Manager'}</strong>. You are currently running in <strong>{api.resetDatabase ? 'Local Database Mode' : 'Server Online Mode'}</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 font-semibold text-xs rounded-xl shadow shadow-indigo-650/20 flex items-center gap-1.5 transition"
          >
            Review Ticket Desk
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <h3 className={`text-3xl font-extrabold tracking-tight ${card.isDanger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-105 dark:border-slate-800/40 flex items-center justify-between text-[10px] font-bold">
                <span className={`px-2 py-0.5 rounded-full border
                  ${card.indicatorUp ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/40' : ''}
                  ${!card.indicatorUp && card.isDanger ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-955/25 dark:text-rose-450 dark:border-rose-900/40' : ''}
                  ${!card.indicatorUp && !card.isDanger ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/25 dark:text-amber-450 dark:border-amber-900/40' : ''}
                `}>
                  {card.indicator}
                </span>
                <span className="text-slate-400 font-semibold">{card.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Workloads Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Support Acquisition Curve */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-808 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Customer Registration Volume</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical growth patterns for client profiles</p>
            </div>
            <div className="text-[10px] bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} />
              Last 6 Months
            </div>
          </div>

          <div className="h-72 w-full pr-4 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/40" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                <YAxis tickLine={false} axisLine={false} dx={-8} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area name="Registrations" type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support Agent queues load charts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-101 dark:border-slate-808 pb-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="text-indigo-500" size={16} />
              Agent Active Workloads
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Tickets active queues per agent</p>
          </div>

          <div className="h-56 w-full text-xs font-semibold">
            {agentWorkloads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentWorkloads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/40" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} dy={8} />
                  <YAxis tickLine={false} axisLine={false} dx={-8} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="tickets" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {agentWorkloads.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-450">No agent workloads registered</div>
            )}
          </div>

          <div className="border-t border-slate-105 dark:border-slate-800/40 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Standard SLA Threshold: 10 Tickets</span>
            <button 
              onClick={() => navigate('/agents')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Balance Workloads
            </button>
          </div>
        </div>

      </div>

      {/* Bottom widgets: Recent Activities timeline feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-101 dark:border-slate-808 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Activity className="text-indigo-500" size={18} />
              Recent Operations Activities Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Chronological system transactional actions audit log</p>
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="relative text-xs">
                {/* Visual Timeline Stepper Nodes */}
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="font-semibold text-slate-750 dark:text-slate-300">
                    {act.text}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 shrink-0 bg-slate-50 dark:bg-slate-805 px-2.5 py-1 rounded-xl border border-slate-150 dark:border-slate-800/40">
                    <Clock size={11} />
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-slate-400 text-xs font-semibold">No recent operations actions recorded.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;