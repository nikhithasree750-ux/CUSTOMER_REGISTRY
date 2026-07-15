import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateInput = (value) => {
    // If it has '@' then it should look like an email
    if (value.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? 'email' : 'invalid_email';
    }
    
    // Otherwise check for phone numbers (only numbers, spaces, parentheses, dashes, or + allowed)
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (phoneRegex.test(value)) {
      return 'phone';
    }
    
    return 'invalid';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const type = validateInput(emailOrPhone.trim());
    if (type === 'invalid_email') {
      toast.error('Please enter a valid email format');
      return;
    } else if (type === 'invalid') {
      toast.error('Please enter a valid email or phone number');
      return;
    }

    setLoading(true);
    try {
      await login(emailOrPhone.trim(), password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setEmailOrPhone('admin@crm.com');
    setPassword('admin123');
    toast.success('Demo credentials loaded!', { icon: '🔑', duration: 1500 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative font-sans">
      
      {/* Animated Glowing Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
      
      {/* Grid Backdrop overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 mb-4 text-white"
          >
            <ShieldCheck size={28} />
          </motion.div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white">
            SalesFlow CRM
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Secure client workspace access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Phone Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email or Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                {emailOrPhone.includes('@') || !emailOrPhone.trim() ? (
                  <Mail size={18} />
                ) : (
                  <Phone size={18} />
                )}
              </span>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email address or mobile..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* Register Account navigation link */}
        <div className="mt-5 text-center text-xs text-slate-500">
          Not registered yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 mb-3 font-medium">
            Testing credentials? Use our administrator preview:
          </p>
          <button
            onClick={handleAutofillDemo}
            className="text-xs px-4 py-2 border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-indigo-400 hover:text-indigo-300 rounded-xl transition duration-200"
          >
            Autofill Demo Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
