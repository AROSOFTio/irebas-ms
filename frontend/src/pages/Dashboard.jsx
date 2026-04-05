import React, { useState, useEffect, useContext } from 'react';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle, Bell, Wallet, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, sub, prefix = '' }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-800 truncate">{prefix}{value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString('en-UG') : value) : '...'}</h3>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isManager = user?.role === 'General Manager' || user?.role_name === 'General Manager';

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
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const severityColor = (sev) => {
        switch(sev?.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'LOW': return 'bg-blue-100 text-blue-700 border border-blue-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isManager ? 'Executive Command Centre' : 'Security Dashboard'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isManager ? 'Full financial & security overview.' : 'Real-time overview of system security status.'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center bg-primeBlue text-white px-4 py-2 rounded-lg shadow hover:bg-primeBlueHover transition text-sm font-semibold"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Report
                </button>
            </div>

            {/* Financial Stat Cards — General Manager only */}
            {isManager && stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Bank Balance" value={stats.totalBalance} icon={Wallet} color="bg-emerald-500" sub="UGX — All Active Accounts" />
                    <StatCard title="Active Customers" value={stats.activeCustomers} icon={Users} color="bg-primeBlue" sub="Created accounts" />
                    <StatCard title="Total Transactions" value={stats.totalTransactions} icon={Activity} color="bg-purple-500" sub="All ledger entries" />
                    <StatCard title="Total Deposited" value={stats.totalDeposits} icon={ArrowDownCircle} color="bg-teal-500" sub="UGX — All-time" />
                </div>
            )}

            {/* Security Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Alarms" value={stats?.totalAlarms} icon={Bell} color="bg-primeBlue" sub="All severity alerts" />
                <StatCard title="Critical Alerts" value={stats?.criticalAlerts} icon={AlertTriangle} color="bg-red-500" sub="Requires immediate action" />
                <StatCard title="Failed Logins" value={stats?.failedLogins} icon={ShieldAlert} color="bg-orange-500" sub="Authentication attempts" />
                <StatCard title="Resolved Incidents" value={stats?.resolvedIncidents} icon={CheckCircle} color="bg-green-500" sub="Closed cases" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions Chart (GM) or Alerts Chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
                    <h3 className="text-base font-bold text-gray-800 mb-5">
                        {isManager ? 'Transaction Volume — Last 7 Days' : 'Security Events — Last 7 Days'}
                    </h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-gray-400">Loading chart...</div>
                        ) : chartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2">
                                <Activity className="w-8 h-8 opacity-40" />
                                <p className="text-sm">No transaction data yet.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                                    {isManager ? (
                                        <>
                                            <Bar dataKey="deposits" fill="#10B981" radius={[4,4,0,0]} name="Deposits" />
                                            <Bar dataKey="withdrawals" fill="#EF4444" radius={[4,4,0,0]} name="Withdrawals" />
                                            <Bar dataKey="transfers" fill="#1455c6" radius={[4,4,0,0]} name="Transfers" />
                                        </>
                                    ) : (
                                        <>
                                            <Bar dataKey="alerts" fill="#1455c6" radius={[4,4,0,0]} name="Alerts" />
                                            <Bar dataKey="incidents" fill="#b12917" radius={[4,4,0,0]} name="Incidents" />
                                        </>
                                    )}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Recent Critical Alerts */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800">Recent Alerts</h3>
                        <a href="/alerts" className="text-xs font-semibold text-primeBlue hover:underline">View all</a>
                    </div>
                    <div className="space-y-3">
                        {recentAlerts.length === 0 && !loading ? (
                            <div className="text-sm text-gray-400 text-center py-4">No alerts found.</div>
                        ) : recentAlerts.slice(0, 4).map((alert) => (
                            <div key={alert.id} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition">
                                <div className="mt-0.5 bg-red-100 p-1.5 rounded-full mr-3 flex-shrink-0">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">{alert.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColor(alert.severity)}`}>{alert.severity}</span>
                                        <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions — General Manager only */}
            {isManager && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Latest Transactions</h3>
                        <a href="/transactions" className="text-xs font-semibold text-primeBlue hover:underline">View all</a>
                    </div>
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount (UGX)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {recentTransactions.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-6 text-center text-gray-400">No transactions yet.</td></tr>
                            ) : recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{tx.first_name} {tx.last_name}</div>
                                        <div className="text-xs font-mono text-gray-400">{tx.account_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tx.transaction_type === 'DEPOSIT' && <span className="text-green-600 font-bold bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs">DEPOSIT</span>}
                                        {tx.transaction_type === 'WITHDRAWAL' && <span className="text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-1 rounded-full text-xs">WITHDRAWAL</span>}
                                        {tx.transaction_type === 'TRANSFER' && <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2 py-1 rounded-full text-xs">TRANSFER</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                        {parseFloat(tx.amount).toLocaleString('en-UG')} UGX
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(tx.created_at).toLocaleString()}
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
