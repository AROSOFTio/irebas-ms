import React, { useContext, useState, useRef, useEffect } from 'react';
import { Menu, Search, UserCircle, BellRing, LogOut, PlayCircle, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const simulateAttack = async () => {
        setSimulating(true);
        try {
            await axios.post('/api/security/simulate');
        } catch (error) {
            console.error("Simulation failed:", error);
        }
        setTimeout(() => setSimulating(false), 500);
    };

    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const [eventsRes, alertsRes] = await Promise.all([
                    axios.get('/api/security/events'),
                    axios.get('/api/security/alerts'),
                ]);
                const q = searchQuery.toLowerCase();
                const eventMatches = eventsRes.data
                    .filter(e => e.event_type?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.ip_address?.includes(q))
                    .slice(0, 3).map(e => ({ label: e.event_type, sub: e.ip_address, route: '/events', type: 'Event' }));
                const alertMatches = alertsRes.data
                    .filter(a => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
                    .slice(0, 3).map(a => ({ label: a.title, sub: a.severity, route: '/alerts', type: 'Alert' }));
                setSearchResults([...eventMatches, ...alertMatches]);
            } catch (e) { /* silent fail */ }
            setSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults([]); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
                <button 
                    onClick={simulateAttack}
                    disabled={simulating}
                    className="hidden sm:flex items-center text-xs font-semibold px-3 py-1.5 bg-accentRed text-white rounded shadow-sm hover:bg-red-800 transition-colors disabled:opacity-50"
                >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Simulate Threat
                </button>

                {/* Functional Search */}
                <div ref={searchRef} className="relative hidden md:block border-l border-gray-200 pl-4">
                    <div className="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search events, alerts..."
                        className="block w-56 pl-9 pr-8 py-1.5 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primeBlue focus:border-primeBlue sm:text-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute inset-y-0 right-1 pr-2 flex items-center text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {(searchResults.length > 0 || searching) && (
                        <div className="absolute top-10 left-4 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                            {searching && <p className="px-4 py-3 text-xs text-gray-500">Searching...</p>}
                            {!searching && searchResults.length === 0 && searchQuery && (
                                <p className="px-4 py-3 text-xs text-gray-500">No results found.</p>
                            )}
                            {searchResults.map((r, i) => (
                                <button key={i} onClick={() => { navigate(r.route); setSearchQuery(''); setSearchResults([]); }}
                                    className="w-full flex items-center px-4 py-2.5 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0">
                                    <span className="text-xs font-bold text-primeBlue bg-blue-100 px-1.5 py-0.5 rounded mr-2">{r.type}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                                        <p className="text-xs text-gray-500">{r.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="p-2 text-gray-500 hover:text-primeBlue transition relative">
                    <span className="sr-only">View notifications</span>
                    <BellRing className="h-6 w-6" />
                    <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-accentRed rounded-full animate-pulse"></span>
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

