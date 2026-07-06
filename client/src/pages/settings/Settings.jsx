import React, { useState, useEffect } from 'react';
import { api, checkServerConnection, isOffline } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  RefreshCw, 
  Database, 
  Monitor, 
  Sparkles, 
  Info,
  Server,
  ToggleLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [offline, setOffline] = useState(isOffline());
  const [checking, setChecking] = useState(false);
  const [systemMode, setSystemMode] = useState(isOffline() ? 'Offline (LocalStorage Fallback)' : 'MERN Online (Express + DB)');

  // Refresh status
  const runDiagnostics = async () => {
    setChecking(true);
    const result = await checkServerConnection();
    setOffline(!result.online);
    setSystemMode(result.online ? 'MERN Online (Express + DB)' : 'Offline (LocalStorage Fallback)');
    setChecking(false);
    toast.success('Diagnostics check completed!', { duration: 1500 });
  };

  const handleResetLocalStorage = () => {
    if (!window.confirm('Resetting offline local database will delete any manual additions and restore the 10 original seed accounts. Continue?')) return;
    
    api.resetDatabase();
    toast.success('Offline LocalStorage database reset to original 10 mock accounts!', {
      icon: '🔄'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10 font-sans">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-indigo-500" size={24} />
          System Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform network diagnostics, configure theme preferences, and manage database seeding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Preferences */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Theme Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Monitor size={16} className="text-indigo-500" />
              Theme & Appearance
            </h3>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-slate-850 dark:text-slate-200">Dark Mode Interface</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle dark backdrop themes throughout the workspace.</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${darkMode ? 'bg-indigo-600' : 'bg-slate-250 dark:bg-slate-800'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          {/* Database & Data Management */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Database size={16} className="text-indigo-500" />
              Local Database Management
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-850 dark:text-slate-200">Reset LocalStorage</p>
                <p className="text-[10px] text-slate-400">Purge manually added records and restore the seed dataset (Sarah Connor, Bruce Wayne, etc.).</p>
              </div>
              <button
                onClick={handleResetLocalStorage}
                className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 size={13} />
                Restore Seed Data
              </button>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Resetting local storage will not affect records saved inside the MongoDB database on the Express server if the server is currently online.
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Network Diagnostics Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Server size={16} className="text-indigo-500" />
              API Diagnostics
            </h3>
            <button
              onClick={runDiagnostics}
              disabled={checking}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition"
              title="Rerun checks"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin text-indigo-500' : ''} />
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Status indicators */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Gateway Status</p>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${offline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {offline ? 'Fallback Database Mode' : 'REST API Online'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Connection Mode</p>
              <p className="text-xs text-slate-650 dark:text-slate-400 font-medium">
                {systemMode}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Client API Endpoint</p>
              <code className="text-[10px] bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-800/80 font-mono block select-all break-all text-slate-600 dark:text-slate-350">
                http://localhost:5001/api
              </code>
            </div>

            {/* Offline troubleshooting guides */}
            {offline && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  Connect MERN Stack
                </p>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  To connect your database and run on MERN stack mode, open your terminal and start the server:
                </p>
                <pre className="text-[9px] bg-slate-950 text-slate-300 p-2.5 rounded-xl border border-slate-850 font-mono select-all overflow-x-auto whitespace-pre-wrap leading-normal">
                  cd server<br />
                  npm install<br />
                  npm run dev
                </pre>
                <p className="text-[9px] text-slate-400 leading-normal">
                  The server automatically manages a fallback database internally using local JSON storage if MongoDB is not running locally.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
