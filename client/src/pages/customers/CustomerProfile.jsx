import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Phone, Briefcase, Calendar, 
  DollarSign, FileText, Plus, Loader2, 
  Printer, TrendingUp, HelpCircle, Star, MessageSquare, ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerProfile = ({ isOpen, onClose, customerId, onUpdate }) => {
  const [customer, setCustomer] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadProfileData = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        // Fetch customer profile
        const profile = await api.getCustomerById(customerId);
        setCustomer(profile);

        // Fetch customer tickets
        const ticketsData = await api.getTickets({ customerId });
        setTickets(ticketsData.tickets || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && customerId) {
      loadProfileData();
    }
  }, [customerId, isOpen]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const updated = await api.addCustomerNote(customer._id, newNote);
      setCustomer(updated);
      setNewNote('');
      toast.success('Internal note added');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setAddingNote(false);
    }
  };

  const handlePrintProfile = () => {
    // Elegant stylesheet injection for printing single profile
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${customer.name} - Profile Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .meta-item { border: 1px solid #f1f5f9; padding: 12px; rounded: 8px; }
            .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-top: 30px; margin-bottom: 15px; }
            table { w-full; border-collapse: collapse; text-align: left; }
            th { padding: 10px; font-size: 11px; text-transform: uppercase; color: #64748b; background-color: #f8fafc; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .timeline-item { border-left: 2px solid #e2e8f0; padding-left: 15px; margin-left: 5px; padding-bottom: 15px; position: relative; }
            .timeline-dot { height: 8px; width: 8px; background-color: #6366f1; border-radius: 50%; position: absolute; left: -5px; top: 5px; }
            .timestamp { font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>Customer Profile: ${customer.name}</h1>
          <div class="meta-grid">
            <div class="meta-item"><strong>Email:</strong> ${customer.email}</div>
            <div class="meta-item"><strong>Phone:</strong> ${customer.phone || 'N/A'}</div>
            <div class="meta-item"><strong>Company:</strong> ${customer.company || 'Self-Employed'}</div>
            <div class="meta-item"><strong>Total Contract LTV:</strong> $${customer.ltv?.toLocaleString()}</div>
          </div>
          
          <div class="section-title">Purchase History</div>
          ${customer.purchaseHistory?.length > 0 ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Contract Price</th>
                  <th>Date Purchased</th>
                </tr>
              </thead>
              <tbody>
                ${customer.purchaseHistory.map(p => `
                  <tr>
                    <td>${p.item}</td>
                    <td>$${p.price.toLocaleString()}</td>
                    <td>${new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="font-size: 13px; color: #94a3b8;">No purchase records found</p>'}

          <div class="section-title">Support Tickets</div>
          ${tickets.length > 0 ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Issue Context</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${tickets.map(t => `
                  <tr>
                    <td><strong>${t.ticketId}</strong></td>
                    <td>${t.description}</td>
                    <td>${t.priority}</td>
                    <td>${t.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="font-size: 13px; color: #94a3b8;">No support tickets registered</p>'}

          <div class="section-title">Interactions Timeline</div>
          ${customer.interactions?.length > 0 ? `
            <div>
              ${customer.interactions.map(i => `
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timestamp">${new Date(i.date).toLocaleString()}</div>
                  <div style="font-size: 13px; font-weight: 650; margin-top: 3px;">${i.type}</div>
                  <div style="font-size: 12px; color: #475569;">${i.summary}</div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="font-size: 13px; color: #94a3b8;">No interaction records logged</p>'}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <AnimatePresence>
      {isOpen && customer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-[1px]"
          />

          {/* Drawer Profile box */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-screen z-50 flex flex-col relative"
          >
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  {customer.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white">{customer.name}</h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Briefcase size={12} /> {customer.company || 'Self-Employed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintProfile}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Print Profile Report"
                >
                  <Printer size={15} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tab Swappers */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 text-xs font-bold bg-slate-50/20 dark:bg-slate-900/10">
              {['overview', 'purchases', 'tickets', 'interactions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 capitalize border-b-2 -mb-px transition
                    ${activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold' 
                      : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Tab container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-500" size={30} />
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & NOTES */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      
                      {/* Contact metadata */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 break-all select-all">
                            <Mail size={13} className="text-slate-400" />
                            {customer.email}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Phone</p>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 select-all">
                            <Phone size={13} className="text-slate-400" />
                            {customer.phone || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize mt-0.5
                            ${customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : ''}
                            ${customer.status === 'Lead' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' : ''}
                            ${customer.status === 'Inactive' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50' : ''}
                          `}>
                            {customer.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Contract LTV</p>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-0.5">
                            <DollarSign size={13} className="text-slate-400" />
                            {customer.ltv?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Internal Notes Feed */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                          <FileText size={14} className="text-indigo-500" />
                          Internal Agent Notes
                        </h4>

                        {/* Add note form */}
                        <form onSubmit={handleAddNote} className="flex gap-2">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add background info, account notes..."
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                          />
                          <button
                            type="submit"
                            disabled={addingNote || !newNote.trim()}
                            className="px-3 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50"
                          >
                            {addingNote ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                          </button>
                        </form>

                        {/* Notes List */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {customer.notesList && customer.notesList.length > 0 ? (
                            customer.notesList.map((note) => (
                              <div 
                                key={note.id} 
                                className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-xl text-xs space-y-1"
                              >
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-500">
                                  <span>{note.author}</span>
                                  <span className="font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-medium">{note.text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">No internal notes added.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: PURCHASE HISTORY */}
                  {activeTab === 'purchases' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                        <DollarSign size={14} className="text-indigo-500" />
                        Account Purchase Logs
                      </h4>
                      <div className="space-y-2">
                        {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
                          customer.purchaseHistory.map((p) => (
                            <div 
                              key={p.id}
                              className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex justify-between items-center text-xs"
                            >
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{p.item}</p>
                                <p className="text-[10px] text-slate-450 flex items-center gap-1">
                                  <Calendar size={11} /> {new Date(p.date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                                <DollarSign size={13} className="text-slate-400" />
                                {p.price.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                            <ClipboardList className="mx-auto text-slate-350 mb-2" size={24} />
                            No purchase transactions found
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TICKETS */}
                  {activeTab === 'tickets' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                        <ClipboardList size={14} className="text-indigo-500" />
                        Registered Support Tickets
                      </h4>
                      <div className="space-y-3">
                        {tickets.length > 0 ? (
                          tickets.map((t) => (
                            <div 
                              key={t._id}
                              className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-3"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">{t.ticketId}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize
                                  ${t.status === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                                  ${t.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                  ${t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                `}>
                                  {t.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-650 dark:text-slate-350 font-medium leading-relaxed">
                                {t.description}
                              </p>
                              <div className="pt-2 border-t border-slate-50 dark:border-slate-800/40 flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                                <span>Priority: {t.priority}</span>
                                <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                            <HelpCircle className="mx-auto text-slate-350 mb-2" size={24} />
                            No support tickets filed for this customer.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTERACTIONS TIMELINE */}
                  {activeTab === 'interactions' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                        <TrendingUp size={14} className="text-indigo-500" />
                        Customer Journey Timeline
                      </h4>

                      <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                        {customer.interactions && customer.interactions.length > 0 ? (
                          customer.interactions.map((i) => (
                            <div key={i.id} className="relative text-xs">
                              {/* Left Timeline Dot */}
                              <span className="absolute -left-6 top-1.5 h-3.5 w-3.5 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-850 dark:text-slate-200">{i.type}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{new Date(i.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                                  {i.summary}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                            No interaction timeline logs recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomerProfile;
