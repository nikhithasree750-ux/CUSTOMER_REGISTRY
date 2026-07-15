import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import CustomerForm from '../../components/customers/CustomerForm';
import CustomerProfile from './CustomerProfile';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Users, 
  Briefcase,
  Calendar,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const location = useLocation();
  const highlightedId = location.state?.highlightId || null;
  const highlightRef = useRef(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const sortQuery = `${sortField}:${sortOrder}`;
      const data = await api.getCustomers({
        search,
        status,
        sort: sortQuery,
        page,
        limit
      });
      setCustomers(data.customers || []);
      setTotalItems(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, status, sortField, sortOrder, page, limit]);

  // Scroll to highlight if needed
  useEffect(() => {
    if (highlightedId && customers.length > 0) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [customers, highlightedId]);

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Toggle selection
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(customers.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // CRUD Operations
  const handleAddClick = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleEditClick = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleDeleteClick = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await api.deleteCustomer(id);
      toast.success('Customer deleted successfully');
      setSelectedIds(prev => prev.filter(item => item !== id));
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected customers?`)) return;

    try {
      // Execute sequentially
      for (const id of selectedIds) {
        await api.deleteCustomer(id);
      }
      toast.success(`Successfully deleted ${selectedIds.length} customers`);
      setSelectedIds([]);
      fetchCustomers();
    } catch (err) {
      toast.error('Bulk deletion encountered errors');
      fetchCustomers();
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus || selectedIds.length === 0) return;
    
    try {
      for (const id of selectedIds) {
        await api.updateCustomer(id, { status: newStatus });
      }
      toast.success(`Updated status for ${selectedIds.length} customers`);
      setSelectedIds([]);
      setBulkStatus('');
      fetchCustomers();
    } catch (err) {
      toast.error('Bulk status update encountered errors');
      fetchCustomers();
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Status', 'LTV Revenue', 'Created At'];
    const rows = customers.map(c => [
      c._id,
      `"${c.name}"`,
      c.email,
      c.phone || '',
      `"${c.company || 'Self-Employed'}"`,
      c.status,
      c.ltv,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_registry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Database registry successfully exported to CSV!', {
      icon: '📊'
    });
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header and Add Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" size={24} />
            Customer Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse directory database, perform customer profiling, and track customer lifetime metrics.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-350 shadow-sm transition"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={handleAddClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-md shadow-indigo-600/10 transition"
          >
            <Plus size={15} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, company, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-48 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden md:inline">Status:</span>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800">
              <span className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
              <span className="text-xs font-semibold">Updating catalog...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/50 select-none">
                
                {/* Checkbox Column */}
                <th className="px-6 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={customers.length > 0 && selectedIds.length === customers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                </th>

                {/* Name */}
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </div>
                </th>

                {/* Company */}
                <th 
                  onClick={() => handleSort('company')}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    Company
                    {sortField === 'company' && (sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </div>
                </th>

                {/* Status */}
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </div>
                </th>

                {/* LTV */}
                <th 
                  onClick={() => handleSort('ltv')}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 text-right"
                >
                  <div className="flex items-center gap-1 justify-end">
                    LTV Revenue
                    {sortField === 'ltv' && (sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </div>
                </th>

                {/* Date Created */}
                <th 
                  onClick={() => handleSort('createdAt')}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </div>
                </th>

                {/* Actions */}
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {customers.length > 0 ? (
                customers.map((cust) => {
                  const isHighlighted = highlightedId === cust._id;
                  const isSelected = selectedIds.includes(cust._id);
                  
                  return (
                    <tr 
                      key={cust._id}
                      ref={isHighlighted ? highlightRef : null}
                      className={`transition duration-150 select-none group cursor-pointer
                        ${isHighlighted ? 'bg-indigo-50/60 dark:bg-indigo-950/20 ring-2 ring-indigo-500 ring-inset' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/20'}
                        ${isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/5' : ''}
                      `}
                      onClick={() => { setSelectedProfileId(cust._id); setProfileOpen(true); }}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(cust._id)}
                          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shadow-sm">
                            {cust.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {cust.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {cust.email}
                            </p>
                            {cust.phone && <p className="text-[10px] text-slate-400/80 mt-0.5">{cust.phone}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-355 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-slate-400" />
                          {cust.company || 'Self-Employed'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border capitalize
                          ${cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : ''}
                          ${cust.status === 'Lead' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' : ''}
                          ${cust.status === 'Inactive' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50' : ''}
                        `}>
                          {cust.status}
                        </span>
                      </td>

                      {/* LTV */}
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200 font-extrabold text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(cust.ltv || 0)}
                      </td>

                      {/* Date Created */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(cust.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleEditClick(cust, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit profile"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(cust._id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Remove account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-14 text-center text-sm text-slate-400 dark:text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="mx-auto text-slate-350" size={32} />
                      <p className="font-semibold">No records match filters</p>
                      <p className="text-xs text-slate-400/80">Refine search text or status queries, or seed initial profiles in Settings.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination controls */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20 dark:bg-slate-900/20">
            {/* Range Info */}
            <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-2">
              <span>Showing {Math.min(totalItems, (page - 1) * limit + 1)} - {Math.min(totalItems, page * limit)} of {totalItems}</span>
              
              <span className="text-slate-300">|</span>
              
              {/* Limit configuration */}
              <div className="flex items-center gap-1 font-semibold text-slate-400">
                <span>Page size:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  className="bg-transparent border-none p-0 pr-5 text-indigo-600 dark:text-indigo-400 font-bold focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 disabled:opacity-40 transition"
              >
                First
              </button>
              
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-40 transition"
              >
                <ChevronLeft size={14} />
              </button>
              
              {/* Page indicators */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Only show current page, 1 page before/after, and bounds
                const isNear = Math.abs(page - pageNum) <= 1;
                const isBoundary = pageNum === 1 || pageNum === totalPages;
                
                if (!isNear && !isBoundary) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-slate-350 text-xs px-1">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition
                      ${page === pageNum 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-40 transition"
              >
                <ChevronRight size={14} />
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 disabled:opacity-40 transition"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-40 animate-bounce duration-[3000ms] backdrop-blur max-w-lg w-11/12 sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 bg-indigo-600 text-indigo-200 flex items-center justify-center font-bold text-xs rounded-full">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold tracking-wide text-slate-350">Selected</span>
          </div>

          <span className="h-4 w-px bg-slate-800 hidden sm:inline" />

          <div className="flex flex-1 sm:flex-initial items-center gap-3 justify-end">
            {/* Bulk status update dropdown */}
            <select
              value={bulkStatus}
              onChange={(e) => {
                const val = e.target.value;
                setBulkStatus(val);
                handleBulkStatusChange(val);
              }}
              className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="">Update Status...</option>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900 text-rose-400 rounded-xl transition duration-200 flex items-center justify-center"
              title="Delete selected accounts"
            >
              <Trash2 size={14} />
            </button>
            
            {/* Cancel Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-200 px-1 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Customer Form Dialog */}
      <CustomerForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setSelectedCustomer(null); }}
        customer={selectedCustomer}
        onSave={fetchCustomers}
      />

      {/* Customer Profile Drawer */}
      <CustomerProfile
        isOpen={profileOpen}
        onClose={() => { setProfileOpen(false); setSelectedProfileId(null); }}
        customerId={selectedProfileId}
        onUpdate={fetchCustomers}
      />

    </div>
  );
};

export default CustomerList;
