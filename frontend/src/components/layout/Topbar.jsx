import React, { useContext, useState } from 'react';
import { Menu, Search, UserCircle, BellRing, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Topbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);

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
                <div className="hidden sm:flex items-center gap-3">
                    <img src="/logo.png" alt="Centenary Logo" className="h-8 object-contain" />
                    <span className="text-lg font-semibold text-gray-800 border-l border-gray-300 pl-3">Security Monitor</span>
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

                <div className="relative border-l pl-4 border-gray-200">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <UserCircle className="h-8 w-8 text-gray-400" />
                        <div className="hidden sm:block text-sm text-left">
                            <p className="font-medium text-gray-700 capitalize">{user?.username || 'Loading...'}</p>
                            <p className="text-xs text-gray-500">{user?.role_name || user?.role || 'Guest'}</p>
                        </div>
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
