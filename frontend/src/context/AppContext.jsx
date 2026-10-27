import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthApi } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dbHealth, setDbHealth] = useState({
    isConnected: false,
    status: 'checking',
    databaseName: 'readsphere',
    host: '127.0.0.1',
    port: 27017,
    collections: { books: 0, readingsessions: 0, readinggoals: 0 },
    troubleshooting: null,
  });
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);

  // Add toast notification
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check backend and local MongoDB health
  const checkDbHealth = useCallback(async () => {
    try {
      const data = await healthApi.checkHealth();
      setDbHealth({
        isConnected: data.database?.connected || false,
        status: data.database?.status || 'connected',
        databaseName: data.database?.databaseName || 'readsphere',
        host: data.database?.host || '127.0.0.1',
        port: data.database?.port || 27017,
        collections: data.database?.collections || { books: 0, readingsessions: 0, readinggoals: 0 },
        troubleshooting: null,
      });
    } catch (err) {
      const isUnavailable = err.status === 503 || err.message?.includes('Database Unavailable');
      setDbHealth({
        isConnected: false,
        status: 'disconnected',
        databaseName: 'readsphere',
        host: '127.0.0.1',
        port: 27017,
        collections: { books: 0, readingsessions: 0, readinggoals: 0 },
        troubleshooting: isUnavailable
          ? err.data?.troubleshooting || ['Start local MongoDB Community Server on port 27017']
          : ['Ensure backend server is running on http://localhost:5002'],
      });
    }
  }, []);

  useEffect(() => {
    checkDbHealth();
    // Poll health every 20 seconds
    const interval = setInterval(checkDbHealth, 20000);
    return () => clearInterval(interval);
  }, [checkDbHealth]);

  return (
    <AppContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        dbHealth,
        checkDbHealth,
        isCompassModalOpen,
        openCompassModal: () => setIsCompassModalOpen(true),
        closeCompassModal: () => setIsCompassModalOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

