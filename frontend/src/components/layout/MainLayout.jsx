import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { io } from 'socket.io-client';
import { AlertCircle, X } from 'lucide-react';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Connect directly to the exposed backend port to bypass nginx strict routes
        const socket = io(`http://${window.location.hostname}:5005`);

        socket.on('new_alert', (alertData) => {
            setToasts(prev => [...prev, alertData]);
            // Auto dismiss after 7 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== alertData.id));
            }, 7000);
        });

        return () => socket.disconnect();
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
            {/* Global Toast Container */}
            <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-80">
                {toasts.map((toast, i) => (
                    <div key={`${toast.id}-${i}`} className="bg-white border-l-4 border-accentRed shadow-lg rounded-r-md p-4 animate-fade-in-down flex items-start">
                        <AlertCircle className="w-5 h-5 text-accentRed flex-shrink-0 mt-0.5 mr-3" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">New Threat: {toast.title}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{toast.description}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="print:hidden">
                <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
            </div>
            
            <div className="flex flex-col flex-1 w-0 lg:ml-64 print:ml-0 transition-all duration-300">
                <div className="print:hidden">
                    <Topbar toggleSidebar={toggleSidebar} />
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-lightBlueBg/30 print:bg-white print:overflow-visible">
                    <div className="py-6 px-4 sm:px-6 md:px-8 h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
