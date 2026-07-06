import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  MessageSquare, Star, Plus, Loader2, 
  Users, AlertCircle, Quote, Sparkles, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      
      // Load feedbacks
      const fbData = await api.getFeedbacks();
      setFeedbacks(fbData || []);

      // Load stats to show average stars
      const statsData = await api.getStats();
      setStats(statsData);

      // Load customers for selection dropdown
      const customersData = await api.getCustomers({ limit: 100 });
      setCustomers(customersData.customers || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load feedback logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!customerId || !rating) {
      toast.error('Please select customer profile and rating stars');
      return;
    }
    setSubmitting(true);
    try {
      await api.createFeedback({ customerId, rating, comment });
      toast.success('Feedback review successfully recorded!');
      setCustomerId('');
      setRating(5);
      setComment('');
      fetchFeedbackData();
    } catch (err) {
      toast.error('Failed to record review');
    } finally {
      setSubmitting(false);
    }
  };

  const getCustomerName = (cId) => {
    const cust = customers.find(c => c._id === cId);
    return cust ? cust.name : 'Registered Client';
  };

  // Safe averages
  const avgStars = stats?.ticketStats?.avgRating || 4.8;
  const totalReviews = feedbacks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10 font-sans">
      
      {/* Left Column: Feedbacks reviews list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={24} />
              Client Reviews Feed
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Read customer reviews, star metrics, and aggregate feedback comments.
            </p>
          </div>
        </div>

        {/* Aggregate stars summary widget */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 rounded-3xl text-white shadow-xl flex items-center gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-44 h-44 bg-yellow-500/10 rounded-full blur-2xl" />
          
          <div className="text-center shrink-0">
            <h3 className="text-5xl font-extrabold text-yellow-450 tracking-tight flex items-center gap-1">
              {avgStars}
              <Star className="fill-yellow-500 text-yellow-500 inline h-8 w-8" />
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Average score</p>
          </div>

          <div className="h-12 w-px bg-slate-800" />

          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Sparkles size={13} />
              Customer Satisfaction (CSAT)
            </p>
            <p className="text-xs text-slate-350 leading-relaxed max-w-sm">
              Consolidated dashboard updates dynamically once new customer reviews are filed. Total reviews count: <strong>{totalReviews} logged</strong>.
            </p>
          </div>
        </div>

        {/* Reviews Cards Feed */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div 
                key={fb._id}
                className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 relative group overflow-hidden"
              >
                <Quote className="absolute right-4 bottom-4 text-slate-100 dark:text-slate-800/40 pointer-events-none group-hover:scale-110 transition duration-300" size={56} />

                {/* Stars and Client Name */}
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-white">{getCustomerName(fb.customerId)}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Rating Stars Icons */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={`
                          ${i < fb.rating 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-slate-250 dark:text-slate-800'
                          }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-655 dark:text-slate-355 font-medium leading-relaxed max-w-md relative z-10">
                  "{fb.comment || 'No feedback comments provided.'}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-450">
            No feedback entries filed yet.
          </div>
        )}
      </div>

      {/* Right Column: Submit Feedback Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">File Customer Review</h3>
          <p className="text-[10px] text-slate-400 mt-1">Record feedback reviews to measure support satisfaction metrics.</p>
        </div>

        <form onSubmit={handleSubmitFeedback} className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Customer Profile</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select customer...</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stars Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Rating Stars</label>
            <div className="flex gap-2 justify-center py-2 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-150 dark:border-slate-850">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition duration-150 transform hover:scale-110"
                >
                  <Star 
                    size={22} 
                    className={`
                      ${star <= rating 
                        ? 'fill-yellow-500 text-yellow-500' 
                        : 'text-slate-300 dark:text-slate-700'
                      }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Review Comment</label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-slate-400">
                <MessageCircle size={14} />
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                placeholder="Write review comments..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Submit Review
          </button>

        </form>
      </div>

    </div>
  );
};

export default FeedbackList;
