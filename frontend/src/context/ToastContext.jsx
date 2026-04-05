import React, { createContext, useState, useCallback, useContext } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-20 right-6 z-[60] flex flex-col gap-3 w-80">
                {toasts.map(toast => (
                    <div key={toast.id} className={`bg-white border-l-4 shadow-lg rounded-r-md p-4 animate-fade-in-down flex items-start ${toast.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 mr-3" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">{toast.type === 'success' ? 'Success' : 'Error'}</p>
                            <p className="text-xs text-gray-600 mt-1">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
