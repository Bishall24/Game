import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userId');
      
      console.log('Loading user from localStorage:', { token, username, role, userId });
      
      if (token && username && role && userId) {
        const userData = { 
          username, 
          role, 
          id: userId,
          token 
        };
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        console.log('No user data found in localStorage');
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userId', userData.id);
    setUser(userData);
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 