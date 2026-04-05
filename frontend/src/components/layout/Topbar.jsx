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
    const displayRole = userRole === 'System Security' ? 'System Security Analyst' : userRole;
    
    // Strict RBAC: Only Top Management + SSA can simulate
    const canSimulate = ['General Manager', 'Manager', 'System Security Analyst', 'System Security'].includes(userRole);

    const simulateAttack = async () => {
        setSimulating(true);
        try {
            const res = await axios.post('/api/incidents/simulate');
            addToast(`Threat Simulation: ${res.data.alert.title}`, 'success');
        } catch (error) {
            console.error("Simulation failed:", error);
            addToast('Unauthorized simulation attempt.', 'error');
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
        <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-6 sm:px-8 lg:px-10 z-30 sticky top-0 shadow-lg shadow-gray-100/50">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-3 mr-4 text-gray-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:flex items-center gap-4">
                    <div className="bg-white p-1 rounded-lg border border-gray-100">
                        <img src="/logo.png" alt="Centenary Logo" className="h-10 object-contain" />
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                        <span className="text-sm font-black text-gray-800 uppercase tracking-tighter block leading-none">Centenary Bank</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mt-1">Security Monitor 3.0</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {canSimulate && (
                    <button 
                        onClick={simulateAttack}
                        disabled={simulating}
                        className="hidden md:flex items-center text-[10px] uppercase font-black tracking-widest px-5 py-2.5 bg-orange-600 text-white rounded-xl shadow-xl hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        {simulating ? 'Generating...' : 'Simulate'}
                    </button>
                )}

                <div ref={searchRef} className="relative hidden lg:block border-l border-gray-100 pl-6">
                    <div className="absolute inset-y-0 left-6 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Systems Query..."
                        className="block w-64 pl-12 pr-10 py-3 border border-gray-100 rounded-2xl bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-sm font-bold transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute inset-y-0 right-2 px-2 flex items-center text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {(searchResults.length > 0 || searching) && (
                        <div className="absolute top-16 left-6 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            {searching && <p className="px-5 py-4 text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">Accessing ledger records...</p>}
                            {!searching && searchResults.length === 0 && searchQuery && (
                                <p className="px-5 py-4 text-[10px] text-gray-400 font-black uppercase">No results in database</p>
                            )}
                            {searchResults.map((r, i) => (
                                <button key={i} onClick={() => { navigate(r.route); setSearchQuery(''); setSearchResults([]); }}
                                    className="w-full flex items-center px-5 py-3.5 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-all group">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md mr-3 shadow-sm ${r.type === 'Alert' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{r.type}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-800 truncate group-hover:text-blue-900 transition-colors">{r.label}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{r.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button className="p-3 text-gray-400 hover:text-blue-600 transition relative bg-gray-50/50 rounded-xl group">
                        <BellRing className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-2.5 right-2.5 block w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                </div>

                <div className="relative border-l pl-6 border-gray-100">
                    <div
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="relative">
                            <UserCircle className="h-10 w-10 text-gray-200 group-hover:text-blue-600 transition-colors" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                        </div>
                        <div className="hidden sm:block text-right leading-tight">
                            <p className="text-sm font-black text-gray-800 group-hover:text-blue-900 transition-colors">
                                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                            </p>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{displayRole}</p>
                        </div>
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 mt-4 w-56 rounded-2xl shadow-2xl py-2 bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Authentication Verified</p>
                                <p className="text-xs text-green-600 font-black mt-1 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Session Active
                                </p>
                            </div>
                            <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center transition-all group">
                                <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
