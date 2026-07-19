import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('crm_currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error loading stored user:', err);
        localStorage.removeItem('crm_currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await api.auth.login(email, password);
    setUser(userData);
    localStorage.setItem('crm_currentUser', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const userData = await api.auth.register(data);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_currentUser');
  };

  const updateProfile = async (data) => {
    const updatedUser = await api.auth.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem('crm_currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
