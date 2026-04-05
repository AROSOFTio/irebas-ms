import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShieldAlert,
    Bell,
    AlertTriangle,
    FileText,
    BarChart3,
    Users,
    Settings,
    Activity,
    UserCircle,
    Wallet,
    LogOut,
    ClipboardList,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// Role-to-nav mapping — explicit and clean per role
const navConfig = {
    'General Manager': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Transactions',    path: '/transactions', icon: Activity },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Incidents',       path: '/incidents',    icon: ClipboardList },
        { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText },
        { name: 'Reports',         path: '/reports',      icon: BarChart3 },
        { name: 'Staff',           path: '/users',        icon: Users },
        { name: 'Customers',       path: '/customers',    icon: UserCircle },
        { name: 'Settings',        path: '/settings',     icon: Settings },
    ],
    'Manager': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Transactions',    path: '/transactions', icon: Activity },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Incidents',       path: '/incidents',    icon: ClipboardList },
        { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText },
        { name: 'Reports',         path: '/reports',      icon: BarChart3 },
        { name: 'Staff',           path: '/users',        icon: Users },
        { name: 'Customers',       path: '/customers',    icon: UserCircle },
    ],
    'System Security': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Transactions',    path: '/transactions', icon: Activity },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Incidents',       path: '/incidents',    icon: ClipboardList },
        { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText },
        { name: 'Reports',         path: '/reports',      icon: BarChart3 },
        { name: 'Staff',           path: '/users',        icon: Users },
        { name: 'Customers',       path: '/customers',    icon: UserCircle },
        { name: 'Settings',        path: '/settings',     icon: Settings },
    ],
    'Front Desk': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Transactions',    path: '/transactions', icon: Activity },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Incidents',       path: '/incidents',    icon: ClipboardList },
    ],
    'IT Officer': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Settings',        path: '/settings',     icon: Settings },
    ],
    'Customer': [
        { name: 'My Account',      path: '/customer/dashboard', icon: Wallet },
    ],
};

const roleColors = {
    'General Manager': 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30',
    'Manager':         'bg-blue-400/20 text-blue-200 border border-blue-400/30',
    'System Security': 'bg-red-400/20 text-red-200 border border-red-400/30',
    'Front Desk':      'bg-green-400/20 text-green-200 border border-green-400/30',
    'IT Officer':      'bg-purple-400/20 text-purple-200 border border-purple-400/30',
    'Customer':        'bg-teal-400/20 text-teal-200 border border-teal-400/30',
};

const Sidebar = ({ isOpen, setSidebarOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const userRole = user?.role_name || user?.role || '';

    const navItems = navConfig[userRole] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2355] text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Logo & Role */}
                <div className="flex flex-col items-center justify-center py-5 px-4 border-b border-white/10 shrink-0">
                    <div className="bg-white p-2 rounded-xl w-full flex justify-center mb-3 shadow-sm">
                        <img src="/logo.png" alt="Centenary Bank" className="h-10 object-contain" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                        {userRole === 'Customer' ? 'Online Banking' : 'Security System'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${roleColors[userRole] || 'bg-white/10 text-white'}`}>
                        {userRole}
                    </span>
                    {user?.first_name && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-full">
                            {user.first_name} {user.last_name}
                        </p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-primeBlue text-white shadow-md'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout at bottom */}
                <div className="px-3 pb-4 border-t border-white/10 pt-3 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
