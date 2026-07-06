import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Mail, Phone, ShieldCheck, 
  Briefcase, Plus, AlertCircle, Loader2, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
  'On Break': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
  Inactive: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
};

const AgentList = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'Manager';

  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Support');
  const [addingAgent, setAddingAgent] = useState(false);

  const fetchAgentsData = async () => {
    try {
      setLoading(true);
      const agentsData = await api.getAgents();
      setAgents(agentsData || []);

      const ticketsData = await api.getTickets();
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load agent workloads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsData();
  }, []);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    setAddingAgent(true);
    try {
      await api.createAgent({ name, email, phone, specialty });
      toast.success('Support agent registered successfully');
      setName('');
      setEmail('');
      setPhone('');
      setSpecialty('General Support');
      fetchAgentsData();
    } catch (err) {
      toast.error(err.message || 'Hiring failed');
    } finally {
      setAddingAgent(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateAgent(id, { status });
      toast.success(`Agent status set to ${status}`);
      fetchAgentsData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Workload computation
  const getAgentActiveTicketCount = (agentId) => {
    // Active statuses are Open, Assigned, In Progress
    return tickets.filter(t => 
      t.assignedAgentId === agentId && 
      (t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress')
    ).length;
  };

  const getWorkloadProgressInfo = (count) => {
    // Max capacity standard is 10 tickets
    const percentage = Math.min(100, (count / 10) * 100);
    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-600 dark:text-emerald-400';
    let capacityLabel = 'Optimal Load';

    if (count >= 8) {
      barColor = 'bg-rose-500';
      textColor = 'text-rose-600 dark:text-rose-400';
      capacityLabel = 'Critical Load';
    } else if (count >= 4) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-600 dark:text-amber-400';
      capacityLabel = 'Medium Load';
    }

    return { percentage, barColor, textColor, capacityLabel };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10 font-sans">
      
      {/* Left side: Agents Workload List */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" size={24} />
            Support Agent Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor active ticket queues, status tracks, and load balance agent portfolios.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="space-y-4">
            {agents.map((agent) => {
              const activeCount = getAgentActiveTicketCount(agent._id);
              const progress = getWorkloadProgressInfo(activeCount);

              return (
                <div 
                  key={agent._id}
                  className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Info */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center font-bold text-sm rounded-xl">
                        {agent.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">{agent.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{agent.specialty}</p>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border capitalize ${STATUS_COLORS[agent.status]}`}>
                        {agent.status}
                      </span>
                      
                      {isManager && (
                        <select
                          value={agent.status}
                          onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-semibold text-slate-650 dark:text-slate-300"
                        >
                          <option value="Active">Active</option>
                          <option value="On Break">On Break</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Workload Progress Bar graph */}
                  <div className="pt-3 border-t border-slate-105 dark:border-slate-800/40 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <BarChart2 size={12} className="text-slate-400" />
                        Workload Load: <strong className={progress.textColor}>{activeCount} Active Tickets</strong>
                      </span>
                      <span className="font-semibold text-slate-400">{progress.capacityLabel}</span>
                    </div>

                    {/* Progress Track */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${progress.barColor}`} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-400">
            No agents registered.
          </div>
        )}
      </div>

      {/* Right side: Register Agent Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Hiring Registration</h3>
          <p className="text-[10px] text-slate-400 mt-1">Register support specialties to assign incoming customer tickets.</p>
        </div>

        {isManager ? (
          <form onSubmit={handleCreateAgent} className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Agent Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserPlus size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Kumar"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@crm.io"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Specialty Tier</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl"
              >
                <option value="General Support">General Support</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing & Subscriptions">Billing & Subscriptions</option>
                <option value="Enterprise Accounts">Enterprise Accounts</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={addingAgent}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow shadow-indigo-600/10 flex items-center justify-center gap-1 transition disabled:opacity-50"
            >
              {addingAgent ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Hire Support Agent
            </button>
            
          </form>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl flex gap-2.5 items-start text-[11px] text-slate-400 leading-normal">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <span>
              <strong>Access Restricted:</strong> Only Manager accounts possess security clearing to hire new support staff or adjust workloads. To test, sign up as a Manager.
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default AgentList;
