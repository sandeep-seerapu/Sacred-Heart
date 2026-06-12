import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="hsl(var(--success))" />;
      case 'error':
        return <AlertCircle size={18} color="hsl(var(--danger))" />;
      case 'warning':
        return <AlertTriangle size={18} color="hsl(var(--warning))" />;
      default:
        return <Info size={18} color="hsl(var(--primary))" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Renderer */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {getIcon(toast.type)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{toast.message}</span>
            </div>
            <button className="modal-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useToast must be used within a NotificationProvider');
  }
  return context.addToast;
};
