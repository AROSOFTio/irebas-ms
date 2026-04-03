import React from 'react';
import { Menu, Search, UserCircle, BellRing } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 shadow-sm">
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primeBlue lg:hidden"
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:block text-xl font-semibold text-gray-800">
                    Centenary Bank Security Monitor
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primeBlue focus:border-primeBlue sm:text-sm"
                    />
                </div>

                <button className="p-2 text-gray-500 hover:text-primeBlue transition relative">
                    <span className="sr-only">View notifications</span>
                    <BellRing className="h-6 w-6" />
                    <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-accentRed rounded-full shadow-solid"></span>
                </button>

                <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-gray-200">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                    <div className="hidden sm:block text-sm">
                        <p className="font-medium text-gray-700">Admin User</p>
                        <p className="text-xs text-gray-500">Security Analyst</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
