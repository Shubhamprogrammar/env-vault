import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // critical for cookies
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('ev_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set user decoded state if token is set
  useEffect(() => {
    if (token) {
      localStorage.setItem('ev_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Basic extraction of payload (JWT is header.payload.signature)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role });
      } catch (err) {
        console.error('Invalid token format');
        logout();
      }
    } else {
      localStorage.removeItem('ev_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  // Response interceptor to handle token refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
              withCredentials: true,
            });
            const newAccessToken = res.data.accessToken;
            setToken(newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Session expired');
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/signin', { email, password });
    const token = res.data.accessToken;
    
    // Set token immediately in headers and localStorage to avoid async 401 race conditions
    localStorage.setItem('ev_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role });
    } catch (err) {
      console.error('Error decoding token on login');
    }
    setToken(token);
    return res.data;
  }

  async function signup(email, password) {
    const res = await api.post('/auth/signup', { email, password });
    const token = res.data.accessToken;
    
    // Set token immediately in headers and localStorage to avoid async 401 race conditions
    localStorage.setItem('ev_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role });
    } catch (err) {
      console.error('Error decoding token on signup');
    }
    setToken(token);
    return res.data;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore errors on logout
    }
    // Clean up storage immediately
    localStorage.removeItem('ev_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
