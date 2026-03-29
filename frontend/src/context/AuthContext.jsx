import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('grekedi-auth');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // Basic mock authentication
    if (username === 'admin' && password === 'stitch2026') {
      const userData = { username: 'admin', role: 'administrator' };
      setUser(userData);
      localStorage.setItem('grekedi-auth', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grekedi-auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
