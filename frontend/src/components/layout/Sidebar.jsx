import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShieldAlert,
    Bell,
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

// Role-to-nav mapping — Updated per strict RBAC
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
        { name: 'Reports',         path: '/reports',      icon: BarChart3 },
        { name: 'Staff',           path: '/users',        icon: Users },
        { name: 'Customers',       path: '/customers',    icon: UserCircle },
    ],
    'System Security Analyst': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
        { name: 'Incidents',       path: '/incidents',    icon: ClipboardList },
        { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText },
        { name: 'Reports',         path: '/reports',      icon: BarChart3 },
        { name: 'Customers',       path: '/customers',    icon: UserCircle },
    ],
    'Front Desk': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Alerts',          path: '/alerts',       icon: Bell },
    ],
    'IT Officer': [
        { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard },
        { name: 'Security Events', path: '/events',       icon: ShieldAlert },
        { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText },
        { name: 'Settings',        path: '/settings',     icon: Settings },
    ],
    'Customer': [
        { name: 'My Account',      path: '/customer/dashboard', icon: Wallet },
    ],
};

const roleColors = {
    'General Manager':         'bg-yellow-400/20 text-yellow-500 border border-yellow-400/30',
    'Manager':                 'bg-blue-400/20 text-blue-500 border border-blue-400/30',
    'System Security Analyst': 'bg-red-400/20 text-red-500 border border-red-400/30',
    'Front Desk':              'bg-green-400/20 text-green-500 border border-green-400/30',
    'IT Officer':              'bg-purple-400/20 text-purple-500 border border-purple-400/30',
    'Customer':                'bg-teal-400/20 text-teal-500 border border-teal-400/30',
};

const Sidebar = ({ isOpen, setSidebarOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const userRole = user?.role_name || user?.role || '';

    // Standardize naming in case it's still 'System Security'
    const displayRole = userRole === 'System Security' ? 'System Security Analyst' : userRole;
    const navItems = navConfig[displayRole] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2355] text-white transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col items-center py-6 px-4 border-b border-white/10 shrink-0">
                    <div className="bg-white p-2 rounded-xl mb-4 w-full flex justify-center shadow-md">
                        <img src="/logo.png" alt="Centenary Bank" className="h-10 object-contain" />
                    </div>
                    <span className={`px-4 py-1 text-[10px] font-extrabold rounded-full ${roleColors[displayRole] || 'bg-white/10'}`}>
                        {displayRole}
                    </span>
                    <p className="text-sm font-bold text-gray-200 mt-2 truncate w-full text-center">
                        {user?.first_name} {user?.last_name}
                    </p>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${isActive ? 'bg-primeBlue text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon className="h-4 w-4 mr-4 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 shrink-0">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="h-4 w-4 mr-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
