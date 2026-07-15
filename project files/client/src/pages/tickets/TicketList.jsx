import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, Plus, Ticket, HelpCircle, 
  AlertTriangle, CheckCircle2, User, Clock, 
  Paperclip, Send, Loader2, Calendar, FileText, ArrowRight, X, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITY_BADGES = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50',
  High: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
  Medium: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50',
  Low: 'bg-slate-50 text-slate-655 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-850'
};

const STEPS = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const TicketList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const highlightedId = location.state?.highlightId || null;
  const highlightRef = useRef(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [agentId, setAgentId] = useState('All');

  // Data States
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ customerId: '', description: '', priority: 'Medium', assignedAgentId: '' });

  // Ticket Detail States
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Load agents & customers for dropdowns
      const agentsData = await api.getAgents();
      setAgents(agentsData || []);

      const customersData = await api.getCustomers({ limit: 100 });
      setCustomers(customersData.customers || []);

      // Load tickets
      const ticketsData = await api.getTickets({
        search,
        status,
        priority,
        agentId
      });
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tickets feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [search, status, priority, agentId]);

  // Handle Highlight routing
  useEffect(() => {
    if (highlightedId && tickets.length > 0) {
      const match = tickets.find(t => t._id === highlightedId || t.ticketId === highlightedId);
      if (match) {
        setSelectedTicket(match);
        setDetailOpen(true);
        setTimeout(() => {
          highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
      }
    }
  }, [tickets, highlightedId]);

  // SLA Time Remaining String
  const getSLATimer = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      return { text: 'SLA Met', expired: false, class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' };
    }
    const diff = new Date(ticket.dueDate) - new Date();
    if (diff < 0) {
      const hoursOver = Math.abs(Math.round(diff / (1000 * 60 * 60)));
      return { text: `Overdue: ${hoursOver}h past due`, expired: true, class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse font-bold' };
    }
    const hoursLeft = Math.round(diff / (1000 * 60 * 60));
    if (hoursLeft === 0) {
      return { text: '< 1 hour left', expired: false, class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' };
    }
    return { text: `${hoursLeft}h remaining`, expired: false, class: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' };
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicketData.customerId || !newTicketData.description.trim()) {
      toast.error('Customer selection and descriptions are required');
      return;
    }
    try {
      await api.createTicket(newTicketData);
      toast.success('Ticket created successfully');
      setCreateOpen(false);
      setNewTicketData({ customerId: '', description: '', priority: 'Medium', assignedAgentId: '' });
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  const handleStatusStepClick = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await api.updateTicket(selectedTicket._id, { status: newStatus });
      setSelectedTicket(updated);
      toast.success(`Ticket status updated to ${newStatus}`);
      fetchInitialData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleAgentChange = async (e) => {
    const val = e.target.value;
    if (!selectedTicket) return;
    try {
      const updated = await api.updateTicket(selectedTicket._id, { 
        assignedAgentId: val,
        status: val ? 'Assigned' : 'Open' 
      });
      setSelectedTicket(updated);
      toast.success('Assigned agent updated');
      fetchInitialData();
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  const handlePriorityChange = async (e) => {
    const val = e.target.value;
    if (!selectedTicket) return;
    try {
      const updated = await api.updateTicket(selectedTicket._id, { priority: val });
      setSelectedTicket(updated);
      toast.success(`Priority set to ${val}`);
      fetchInitialData();
    } catch (err) {
      toast.error('Priority update failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    setSavingComment(true);
    try {
      const updated = await api.updateTicket(selectedTicket._id, {
        newComment: {
          author: user?.name || 'Gowtham',
          text: commentText
        }
      });
      setSelectedTicket(updated);
      setCommentText('');
      toast.success('Comment added to feed');
      fetchInitialData();
    } catch (err) {
      toast.error('Comment failed to save');
    } finally {
      setSavingComment(false);
    }
  };

  const handleAttachFile = async () => {
    if (!selectedTicket) return;
    const filenames = ['screenshot.png', 'diagnostics_report.pdf', 'system_error.jpg'];
    const selectedFile = filenames[Math.floor(Math.random() * filenames.length)];
    
    const attachments = [...(selectedTicket.attachments || []), { filename: selectedFile, url: '#' }];
    
    try {
      const updated = await api.updateTicket(selectedTicket._id, { attachments });
      setSelectedTicket(updated);
      toast.success(`Mock file "${selectedFile}" attached!`);
      fetchInitialData();
    } catch (err) {
      toast.error('File attachment failed');
    }
  };

  const getCustomerName = (cId) => {
    const cust = customers.find(c => c._id === cId);
    return cust ? cust.name : 'Unknown Customer';
  };

  const getAgentName = (aId) => {
    const ag = agents.find(a => a._id === aId);
    return ag ? ag.name : 'Unassigned';
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Ticket className="text-indigo-500" size={24} />
            Support Ticketing Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Assign agents, monitor SLA due timers, file comments, and track progress timelines.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition"
        >
          <Plus size={15} />
          Create Ticket
        </button>
      </div>

      {/* Filters Board */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID or descriptions..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Agent Filter */}
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="All">All Agents</option>
          {agents.map(a => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Tickets Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((t) => {
            const sla = getSLATimer(t);
            const isHigh = highlightedId === t._id || highlightedId === t.ticketId;

            return (
              <div
                key={t._id}
                ref={isHigh ? highlightRef : null}
                onClick={() => { setSelectedTicket(t); setDetailOpen(true); }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition duration-200 cursor-pointer flex flex-col justify-between h-48 select-none relative
                  ${isHigh ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 border-indigo-500 bg-indigo-50/10' : 'border-slate-250 dark:border-slate-800'}`}
              >
                <div>
                  {/* Card Header info */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {t.ticketId}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border capitalize ${PRIORITY_BADGES[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>

                  {/* Client name & Description */}
                  <p className="text-slate-400 text-[10px] font-semibold">{getCustomerName(t.customerId)}</p>
                  <p className="text-slate-750 dark:text-slate-300 text-xs font-bold leading-relaxed line-clamp-2 mt-1">
                    {t.description}
                  </p>
                </div>

                {/* Footer status / Agent info */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className={`px-2 py-1.5 rounded-full border text-[9px] ${sla.class}`}>
                    {sla.text}
                  </span>
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    <span>{getAgentName(t.assignedAgentId)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
          <div className="max-w-xs mx-auto space-y-3">
            <span className="text-4xl block">📭</span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Tickets Found</p>
            <p className="text-xs text-slate-400">Create your first support ticket to track resolution deadlines and agents workloads.</p>
            <button 
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-150 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl transition"
            >
              File Support Ticket
            </button>
          </div>
        </div>
      )}

      {/* CREATE TICKET DIALOG MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
          
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white">File Support Ticket</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Register ticket descriptions, client entities, and priority timers.</p>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              
              {/* Customer Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Customer Profile</label>
                <select
                  required
                  value={newTicketData.customerId}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-850 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.company || 'Self'})</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">Priority Level (SLA target)</label>
                <select
                  value={newTicketData.priority}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-850 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Low">Low (7 days)</option>
                  <option value="Medium">Medium (3 days)</option>
                  <option value="High">High (24 hours)</option>
                  <option value="Critical">Critical (4 hours)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">Issue Description</label>
                <textarea
                  required
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Describe details of client problem..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-850 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow"
                >
                  File Ticket
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* TICKET DETAILS SLIDING PANEL */}
      <AnimatePresence>
        {detailOpen && selectedTicket && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-[1px]" onClick={() => setDetailOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-205 dark:border-slate-800 shadow-2xl h-screen z-50 flex flex-col relative"
            >
              
              {/* Header info */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                    {selectedTicket.ticketId}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border capitalize ${PRIORITY_BADGES[selectedTicket.priority]}`}>
                      {selectedTicket.priority}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Client: {getCustomerName(selectedTicket.customerId)}</p>
                </div>
                <button 
                  onClick={() => setDetailOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Details Content Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* SLA Timer Alert Banner */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Due Deadline</p>
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Calendar size={13} className="text-slate-400" />
                      {new Date(selectedTicket.dueDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">SLA Countdown</p>
                    <span className={`px-2 py-1 inline-block rounded-full border text-[9px] ${getSLATimer(selectedTicket).class}`}>
                      {getSLATimer(selectedTicket).text}
                    </span>
                  </div>
                </div>

                {/* VISUAL STEPPER STATUS PROGRESS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Workflow Step</h4>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-805 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 overflow-x-auto gap-2">
                    {STEPS.map((step, idx) => {
                      const isCurrent = selectedTicket.status === step;
                      const isPassed = STEPS.indexOf(selectedTicket.status) >= idx;

                      return (
                        <button
                          key={step}
                          onClick={() => handleStatusStepClick(step)}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition whitespace-nowrap
                            ${isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow' : ''}
                            ${!isCurrent && isPassed ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400' : ''}
                            ${!isCurrent && !isPassed ? 'border-slate-200 dark:border-slate-800 text-slate-400' : ''}
                          `}
                        >
                          {isPassed && !isCurrent ? <CheckCircle2 size={11} /> : null}
                          {step}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Issue Context</h4>
                  <p className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Agent & Priority assignment fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Assigned Agent</label>
                    <select
                      value={selectedTicket.assignedAgentId}
                      onChange={handleAgentChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100"
                    >
                      <option value="">Unassigned</option>
                      {agents.map(a => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">Priority Level</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={handlePriorityChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* File Attachments */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">File Attachments</h4>
                    <button 
                      onClick={handleAttachFile}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-bold"
                    >
                      <Paperclip size={11} />
                      Attach mock file
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                      selectedTicket.attachments.map((file, idx) => (
                        <div 
                          key={idx}
                          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center gap-2 text-xs font-semibold"
                        >
                          <FileText size={13} className="text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-350 flex-1">{file.filename}</span>
                          <span className="text-[9px] text-slate-400">Mock File</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-450 dark:text-slate-500">No attachments provided.</p>
                    )}
                  </div>
                </div>

                {/* Comments feed */}
                <div className="space-y-4 pt-4 border-t border-slate-105 dark:border-slate-800/60">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Feed Discussion</h4>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Type ticket resolution comments..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder-slate-450 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={savingComment || !commentText.trim()}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50"
                    >
                      {savingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </form>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                      selectedTicket.comments.map((c, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-800/20">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            <span>{c.author}</span>
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{c.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">No communication logs recorded.</p>
                    )}
                  </div>
                </div>

                {/* Event timeline history logs */}
                <div className="space-y-3 pt-4 border-t border-slate-105 dark:border-slate-800/60">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Lifecycle Audit Log</h4>
                  <div className="relative pl-4 space-y-3 before:absolute before:inset-y-0 before:left-1 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                    {selectedTicket.timeline && selectedTicket.timeline.map((event, idx) => (
                      <div key={idx} className="relative text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="absolute -left-4 top-1 h-2 w-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900" />
                        <span>{event.event}</span>
                        <span className="text-[9px] text-slate-400 font-medium ml-2">({new Date(event.timestamp).toLocaleTimeString()})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TicketList;
