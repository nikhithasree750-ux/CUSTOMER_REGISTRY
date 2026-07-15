import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { checkServerConnection, isOffline, api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Bell,
  Search,
  Users,
  Ticket,
  ShieldAlert,
  MessageSquare,
  Menu,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [offline, setOffline] = useState(isOffline());
  const [checking, setChecking] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Notifications State
  const [activities, setActivities] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Initial seed count

  // Fetch activities feed
  const loadActivities = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setOffline(isOffline());
    loadActivities();
  }, []);

  // Sync activities on dropdown open
  useEffect(() => {
    if (showBellDropdown) {
      loadActivities();
      setUnreadCount(0); // Mark read
    }
  }, [showBellDropdown]);

  // Handle Global Search change
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const res = await api.globalSearch(val);
      setSearchResults(res);
      setShowSearchDropdown(true);
    } else {
      setSearchResults(null);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (type, id) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    
    if (type === 'customer') {
      navigate('/customers', { state: { highlightId: id } });
    } else if (type === 'ticket') {
      navigate('/tickets', { state: { highlightId: id } });
    } else if (type === 'agent') {
      navigate('/agents');
    } else if (type === 'feedback') {
      navigate('/feedback');
    }
  };

  const handleCheckConnection = async () => {
    if (checking) return;
    setChecking(true);
    const result = await checkServerConnection();
    setOffline(!result.online);
    setChecking(false);
    
    if (result.online) {
      toast.success('Connected to REST API.');
    } else {
      toast.error('Offline LocalStorage mode active.');
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-bold text-slate-800 dark:text-white capitalize hidden sm:block">
          {title}
        </h1>
      </div>

      {/* GLOBAL SEARCH BAR */}
      <div className="relative flex-1 max-w-md mx-6 hidden md:block">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
          placeholder="Global Search everywhere..."
          className="w-full pl-10 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
        />

        {/* Global Search Dropdown */}
        {showSearchDropdown && searchResults && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)} />
            <div className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto py-2">
              
              {/* Customers section */}
              {searchResults.customers.length > 0 && (
                <div>
                  <div className="px-4 py-1 bg-slate-50 dark:bg-slate-850 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Customers
                  </div>
                  {searchResults.customers.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => handleSearchResultClick('customer', c._id)}
                      className="px-4 py-2 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-2.5 text-xs font-medium"
                    >
                      <Users size={14} className="text-slate-400" />
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tickets section */}
              {searchResults.tickets.length > 0 && (
                <div>
                  <div className="px-4 py-1 bg-slate-50 dark:bg-slate-850 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Support Tickets
                  </div>
                  {searchResults.tickets.map(t => (
                    <div 
                      key={t._id}
                      onClick={() => handleSearchResultClick('ticket', t._id)}
                      className="px-4 py-2 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-2.5 text-xs font-medium"
                    >
                      <Ticket size={14} className="text-slate-400" />
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{t.ticketId}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agents section */}
              {searchResults.agents.length > 0 && (
                <div>
                  <div className="px-4 py-1 bg-slate-50 dark:bg-slate-850 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Agents
                  </div>
                  {searchResults.agents.map(a => (
                    <div 
                      key={a._id}
                      onClick={() => handleSearchResultClick('agent', a._id)}
                      className="px-4 py-2 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-2.5 text-xs font-medium"
                    >
                      <ShieldAlert size={14} className="text-slate-400" />
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{a.name}</p>
                        <p className="text-[10px] text-slate-400">{a.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {searchResults.customers.length === 0 && searchResults.tickets.length === 0 && searchResults.agents.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No records match your search
                </div>
              )}

            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status diagnostics */}
        <div 
          onClick={handleCheckConnection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border select-none group transition-all duration-300
            ${offline 
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/60' 
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100/60'
            }`}
        >
          {offline ? <WifiOff size={13} className="animate-pulse" /> : <Wifi size={13} />}
          <span className="hidden lg:inline-block">
            {offline ? 'Local Database Mode' : 'Connected to Server'}
          </span>
          
          <RefreshCw 
            size={12} 
            className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-550 
              ${checking ? 'animate-spin text-indigo-500' : 'group-hover:rotate-180'}`} 
          />
        </div>

        {/* NOTIFICATION CENTER BELL POPULAR */}
        <div className="relative">
          <button
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-indigo-100 flex items-center justify-center font-bold text-[9px] rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Activity feed drop-down */}
          {showBellDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wide">🔔 Notifications Log</h3>
                  <button 
                    onClick={() => { setActivities([]); addLocalActivity('Notifications feed cleared.'); }}
                    className="text-[10px] text-slate-400 hover:text-indigo-500 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {activities.length > 0 ? (
                    activities.map((act) => (
                      <div key={act.id} className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-[11px] text-slate-600 dark:text-slate-355 leading-relaxed font-medium">
                        <p>{act.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications recorded
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 transition duration-200"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-8 w-8 rounded-full border border-indigo-200 dark:border-slate-700 object-cover" 
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="hidden lg:inline-block text-sm font-semibold text-slate-700 dark:text-slate-300 pr-1">
              {user?.name || 'Administrator'}
            </span>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 transition duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{user?.role || 'Agent'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    toast.success('Logged out successfully');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-medium transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
