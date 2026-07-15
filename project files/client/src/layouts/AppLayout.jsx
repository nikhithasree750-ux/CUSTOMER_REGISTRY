import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { checkServerConnection } from '../services/api';

const AppLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Check connection status in background once when layout loads
  useEffect(() => {
    checkServerConnection();
  }, []);

  // Map paths to user friendly headers
  const getPageTitle = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    return parts[0];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar overlay drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <Sidebar collapsed={false} setCollapsed={setMobileSidebarOpen} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Workspace */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ 
          paddingLeft: sidebarCollapsed ? '70px' : '260px',
        }}
        // Apply inline styles for grid offsets on desktop only
        ref={(el) => {
          if (el) {
            if (window.innerWidth < 768) {
              el.style.paddingLeft = '0px';
            }
          }
        }}
      >
        {/* Header */}
        <Header 
          onMenuClick={() => setMobileSidebarOpen(true)} 
          title={getPageTitle(location.pathname)} 
        />

        {/* Content Body with Page Transitions */}
        <main className="flex-1 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
