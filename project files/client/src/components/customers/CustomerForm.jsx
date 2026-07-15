import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save, User, Mail, Phone, Briefcase, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerForm = ({ isOpen, onClose, customer, onSave }) => {
  const isEdit = !!customer;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead',
    ltv: 0,
    notes: ''
  });

  // Load existing customer data on edit
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        status: customer.status || 'Lead',
        ltv: customer.ltv || 0,
        notes: customer.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'Lead',
        ltv: 0,
        notes: ''
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ltv' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Customer email is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.updateCustomer(customer._id, formData);
        toast.success('Customer updated successfully!');
      } else {
        await api.createCustomer(formData);
        toast.success('Customer created successfully!');
      }
      onSave(); // Refresh parent table
      onClose(); // Close modal
    } catch (error) {
      toast.error(error.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Form Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {isEdit ? 'Update Customer Profile' : 'Register New Customer'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? 'Modify details for this existing account.' : 'Create a new client card in your database.'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields container */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Phone & Company grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Briefcase size={16} />
                    </span>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Status & LTV grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Account Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Lifetime Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    LTV Revenue ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <DollarSign size={16} />
                    </span>
                    <input
                      type="number"
                      name="ltv"
                      min="0"
                      step="0.01"
                      value={formData.ltv}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Internal Notes
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-slate-400 dark:text-slate-500">
                    <FileText size={16} />
                  </span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add background info, communication history, preference details..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-white dark:bg-slate-900 sticky bottom-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/10 flex items-center gap-1.5 transition disabled:opacity-55"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      {isEdit ? 'Save Changes' : 'Register Customer'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomerForm;
