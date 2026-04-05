import React, { useContext, useState, useRef, useEffect } from 'react';
import { Menu, Search, UserCircle, BellRing, LogOut, Zap, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useToast();
    const [showDropdown, setShowDropdown] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const userRole = user?.role_name || user?.role || '';
    const canSimulate = ['General Manager', 'Manager', 'System Security'].includes(userRole);

    const simulateAttack = async () => {
        setSimulating(true);
        try {
            const res = await axios.post('/api/incidents/simulate');
            addToast(`Simulation started: ${res.data.alert.title}`, 'success');
        } catch (error) {
            console.error("Simulation failed:", error);
            addToast('Simulation request failed.', 'error');
        } finally {
            setTimeout(() => setSimulating(false), 800);
        }
    };

    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const [txRes, alertsRes] = await Promise.all([
                    axios.get('/api/transactions'),
                    axios.get('/api/dashboard/stats'),
                ]);
                const q = searchQuery.toLowerCase();
                
                // Simplified mock search for demonstration
                const alertMatches = (alertsRes.data.recentAlerts || [])
                    .filter(a => a.title?.toLowerCase().includes(q))
                    .slice(0, 3).map(a => ({ label: a.title, sub: a.severity, route: '/alerts', type: 'Alert' }));
                
                const txMatches = (txRes.data || [])
                    .filter(t => t.account_number?.includes(q) || t.first_name?.toLowerCase().includes(q))
                    .slice(0, 3).map(t => ({ label: `${t.first_name} ${t.last_name}`, sub: t.account_number, route: '/transactions', type: 'TX' }));

                setSearchResults([...alertMatches, ...txMatches]);
            } catch (e) { /* silent fail */ }
            setSearching(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults([]); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 shadow-sm">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:flex items-center gap-3">
                    <img src="/logo.png" alt="Centenary Logo" className="h-8 object-contain" />
                    <span className="text-lg font-bold text-gray-800 border-l border-gray-300 pl-3 uppercase tracking-tighter">Centenary Security Monitor</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {canSimulate && (
                    <button 
                        onClick={simulateAttack}
                        disabled={simulating}
                        className="hidden sm:flex items-center text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        {simulating ? 'Firing...' : 'Simulate'}
                    </button>
                )}

                <div ref={searchRef} className="relative hidden md:block border-l border-gray-100 pl-4">
                    <div className="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Quick Search..."
                        className="block w-48 pl-9 pr-8 py-1.5 border border-gray-200 rounded-full bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primeBlue focus:border-primeBlue sm:text-sm transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute inset-y-0 right-1 pr-2 flex items-center text-gray-400">
                            <X className="h-3.5 h-3.5" />
                        </button>
                    )}
                    {(searchResults.length > 0 || searching) && (
                        <div className="absolute top-12 left-4 w-72 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                            {searching && <p className="px-4 py-3 text-xs text-gray-500 italic">Searching database...</p>}
                            {!searching && searchResults.length === 0 && searchQuery && (
                                <p className="px-4 py-3 text-xs text-gray-500">No matches found.</p>
                            )}
                            {searchResults.map((r, i) => (
                                <button key={i} onClick={() => { navigate(r.route); setSearchQuery(''); setSearchResults([]); }}
                                    className="w-full flex items-center px-4 py-2.5 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 ${r.type === 'Alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.type}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{r.label}</p>
                                        <p className="text-[10px] text-gray-400">{r.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-primeBlue transition relative">
                        <BellRing className="h-5 h-5" />
                        <span className="absolute top-1 right-1 block w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                    </button>
                </div>

                <div className="relative border-l pl-4 border-gray-100">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <UserCircle className="h-8 w-8 text-gray-300 group-hover:text-primeBlue transition-colors" />
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-gray-800 leading-tight">
                                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                            </p>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-tighter">{userRole}</p>
                        </div>
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-48 rounded-xl shadow-2xl py-1 bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 animate-fade-in-down overflow-hidden">
                            <div className="px-4 py-2 border-b border-gray-50">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Account Status</p>
                                <p className="text-xs text-green-600 font-bold">Online & Active</p>
                            </div>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center transition-all">
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
