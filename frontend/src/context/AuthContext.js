import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('csm_token');
    const stored = localStorage.getItem('csm_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      api.get('/auth/me').then(r => {
        setUser(r.data);
        localStorage.setItem('csm_user', JSON.stringify(r.data));
      }).catch(() => logout()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('csm_token', data.token);
    localStorage.setItem('csm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('csm_token', data.token);
    localStorage.setItem('csm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('csm_token');
    localStorage.removeItem('csm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
