import React, { useState, useEffect, useContext } from 'react';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle, Bell, Wallet, Users, ArrowDownCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, sub, prefix = '' }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-800 truncate">{prefix}{value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString('en-UG') : value) : '0'}</h3>
                {sub && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{sub}</p>}
            </div>
            <div className={`p-3 rounded-2xl ${color} flex-shrink-0 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userRole = user?.role_name || user?.role || '';
    
    // Permission Groups
    const isTopManagement = ['General Manager', 'Manager'].includes(userRole);
    const isSecurityAdmin  = ['General Manager', 'Manager', 'System Security Analyst'].includes(userRole);

    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('/api/dashboard/stats');
                setStats(res.data.stats);
                setChartData(res.data.chartData);
                setRecentAlerts(res.data.recentAlerts);
                setRecentTransactions(res.data.recentTransactions || []);
            } catch (error) {
                console.error("Dashboard fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const severityColor = (sev) => {
        switch(sev?.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
            case 'HIGH':     return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'MEDIUM':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default:         return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 font-bold animate-pulse">Initializing Dashboard Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Role Instance: {userRole}</p>
                </div>
                {isTopManagement && (
                    <button onClick={() => navigate('/reports')} className="bg-[#0a2355] text-white px-5 py-2.5 rounded-xl shadow-xl hover:bg-blue-900 transition font-bold text-sm">
                        Reports Console
                    </button>
                )}
            </div>

            {/* Financial Stats — Restricted to GM and Manager */}
            {isTopManagement && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Total Bank Balance" value={stats.totalBalance} icon={Wallet} color="bg-emerald-600" sub="UGX — All Accounts" />
                    <StatCard title="Active Customers" value={stats.activeCustomers} icon={Users} color="bg-[#0a2355]" sub="Verified Portfolios" />
                    <StatCard title="Daily Transactions" value={stats.totalTransactions} icon={Activity} color="bg-indigo-600" sub="Ledger Volume" />
                    <StatCard title="All-Time Deposits" value={stats.totalDeposits} icon={ArrowDownCircle} color="bg-teal-600" sub="UGX — Consolidated" />
                </div>
            )}

            {/* Security Stats — Restricted to Top Management + SSA */}
            {isSecurityAdmin && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Active Alarms" value={stats.totalAlarms} icon={Bell} color="bg-[#0a2355]" sub="Security Feeds" />
                    <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={AlertTriangle} color="bg-red-600" sub="Immediate Attention" />
                    <StatCard title="Blocked Logins" value={stats.failedLogins} icon={ShieldAlert} color="bg-orange-600" sub="Authentication Logs" />
                    <StatCard title="Resolved Cases" value={stats.resolvedIncidents} icon={CheckCircle} color="bg-green-600" sub="Incidents Closed" />
                </div>
            )}

            {/* Main Visuals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">{isTopManagement ? 'Financial Trends' : 'Security Trendline'}</h3>
                        <Activity className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="p-6 h-72">
                        {chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-300 font-bold italic">Insufficient Data Point History</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                                    {isTopManagement ? (
                                        <Bar dataKey="deposits" fill="#10B981" radius={[6,6,0,0]} name="Deposits" />
                                    ) : (
                                        <Bar dataKey="alerts" fill="#EF4444" radius={[6,6,0,0]} name="Alerts" />
                                    )}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Active Alerts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Live Alerts</h3>
                        <Bell className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="p-4 space-y-3">
                        {recentAlerts.length === 0 ? (
                            <p className="text-center text-gray-400 text-xs font-bold py-10 uppercase italic tracking-widest">All Systems Normal</p>
                        ) : recentAlerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all cursor-default">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${severityColor(alert.severity)}`}>{alert.severity}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 leading-tight">{alert.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Financial Ledger — Restricted to Top Management */}
            {isTopManagement && recentTransactions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Financial Ledger (Recent)</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Customer Portfolio</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase text-right">Volume (UGX)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-800">{tx.first_name} {tx.last_name}</div>
                                        <div className="text-[10px] font-mono text-gray-400">{tx.account_number}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${tx.transaction_type === 'DEPOSIT' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{tx.transaction_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-gray-800 text-right">
                                        {parseFloat(tx.amount).toLocaleString('en-UG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
