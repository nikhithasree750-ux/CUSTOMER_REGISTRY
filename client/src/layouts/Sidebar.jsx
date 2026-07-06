import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Ticket,
  ShieldAlert, 
  MessageSquare,
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    { name: 'Agents', path: '/agents', icon: ShieldAlert },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.div 
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-100 z-30 flex flex-col border-r border-slate-800 shadow-2xl`}
      animate={{ width: collapsed ? '70px' : '260px' }}
      transition={{ type: 'spring', damping: 20, stiffness: 120 }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 overflow-hidden">
        <motion.div 
          className="flex items-center gap-2"
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-500/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 tracking-wide text-lg">
              SalesFlow CRM
            </span>
          )}
        </motion.div>

        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block relative"
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-205 select-none group
                    ${isActive 
                      ? 'text-white font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 rounded-xl -z-10 shadow-lg shadow-indigo-600/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110 group-hover:text-indigo-400'}`} />
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                  
                  {collapsed && (
                    <div className="absolute left-16 px-2 py-1 bg-slate-950 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-slate-800 z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 overflow-hidden text-xs text-slate-500">
        {!collapsed ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400 font-medium">v1.2.0 (Premium)</span>
            </div>
            <span>System Active</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
