import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShieldAlert,
    Bell,
    AlertTriangle,
    FileText,
    BarChart3,
    Users,
    Settings,
    Activity
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// Each item declares which roles can see it (empty = all roles)
const allNavItems = [
    { name: 'Dashboard',       path: '/dashboard',    icon: LayoutDashboard, roles: [] },
    { name: 'Transactions',    path: '/transactions', icon: Activity,        roles: [] },
    { name: 'Security Events', path: '/events',       icon: ShieldAlert,     roles: [] },
    { name: 'Alerts',          path: '/alerts',       icon: Bell,            roles: [] },
    { name: 'Incidents',       path: '/incidents',    icon: AlertTriangle,   roles: [] },
    { name: 'Audit Logs',      path: '/audit-logs',   icon: FileText,        roles: ['General Manager', 'Manager', 'System Security'] },
    { name: 'Reports',         path: '/reports',      icon: BarChart3,       roles: ['General Manager', 'Manager'] },
    { name: 'Users',           path: '/users',        icon: Users,           roles: ['General Manager', 'Manager'] },
    { name: 'Settings',        path: '/settings',     icon: Settings,        roles: ['General Manager'] },
];

const Sidebar = ({ isOpen, setSidebarOpen }) => {
    const { user } = useContext(AuthContext);
    const userRole = user?.role_name || user?.role || '';

    const navItems = allNavItems.filter(item =>
        item.roles.length === 0 || item.roles.includes(userRole)
    );

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2355] text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
                <div className="flex flex-col items-center justify-center py-6 px-4 border-b border-white/10 shrink-0">
                    <div className="bg-white p-2 rounded-xl w-full flex justify-center mb-2 shadow-sm">
                        <img src="/logo.png" alt="Centenary Bank" className="h-10 object-contain" />
                    </div>
                    <span className="text-xs font-semibold tracking-wider text-gray-400 mt-2">SECURITY SYSTEM</span>
                    {/* Role badge */}
                    <span className="mt-2 px-3 py-0.5 text-xs font-bold rounded-full bg-primeBlue/60 text-white">
                        {userRole}
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                ${isActive ? 'bg-primeBlue text-white shadow-md' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;

