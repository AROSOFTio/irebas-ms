import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
            
            <div className="flex flex-col flex-1 w-0 lg:ml-64 transition-all duration-300">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-lightBlueBg/30">
                    <div className="py-6 px-4 sm:px-6 md:px-8 h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
