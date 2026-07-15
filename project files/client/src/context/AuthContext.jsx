import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('crm_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // API backend check / local storage check
    const loggedUser = await api.loginUser(email, password);
    localStorage.setItem('crm_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name, email, phone, password, role) => {
    const registeredUser = await api.registerUser({
      name,
      email,
      phone,
      password,
      role: role || 'Agent'
    });
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('crm_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    if (!user) return;
    const updated = await api.updateProfile(user._id, data);
    const merged = { ...user, ...updated };
    localStorage.setItem('crm_user', JSON.stringify(merged));
    setUser(merged);
    return merged;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return;
    await api.changePassword(user._id, currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, changePassword, loading }}>
      {children}
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
