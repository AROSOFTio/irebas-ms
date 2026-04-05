import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DownloadCloud, Wallet, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const COLORS = ['#1455c6', '#EF4444', '#F59E0B', '#10B981', '#6366F1'];

const Reports = () => {
    const { user } = useContext(AuthContext);
    const isManager = user?.role === 'General Manager' || user?.role_name === 'General Manager';
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/reports/summary');
                setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    const exportPDF = () => window.print();

    if (!stats) return <div className="text-gray-400 text-center py-12">Loading metrics...</div>;

    return (
        <div className="print:m-0 print:p-0 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Executive Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Security & Financial performance bulletins.</p>
                </div>
                <button onClick={exportPDF}
                    className="flex items-center text-sm font-semibold px-4 py-2 bg-primeBlue text-white rounded-lg shadow hover:bg-primeBlueHover transition">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export PDF
                </button>
            </div>

            {/* PDF Header */}
            <div className="hidden print:flex justify-between items-end border-b-2 border-primeBlue pb-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-primeBlue">EXECUTIVE SECURITY & FINANCIAL REPORT</h1>
                    <p className="text-gray-500 font-mono mt-1">Generated: {new Date().toLocaleString()}</p>
                </div>
                <img src="/logo.png" className="h-12 object-contain" alt="Logo" />
            </div>

            {/* ── FINANCIAL SECTION (General Manager) ── */}
            {isManager && (
                <>
                    <div className="border-l-4 border-emerald-500 pl-3 mb-2">
                        <h2 className="text-lg font-bold text-gray-800">Financial Overview</h2>
                        <p className="text-sm text-gray-500">Real-time banking ledger summary.</p>
                    </div>

                    {/* Financial KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg"><Wallet className="w-4 h-4 text-emerald-600" /></div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Bank Balance</p>
                            </div>
                            <p className="text-2xl font-extrabold text-emerald-700">{stats.financialStats.totalBalance.toLocaleString('en-UG')}</p>
                            <p className="text-xs text-gray-400 mt-1">UGX</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Active Accounts</p>
                            </div>
                            <p className="text-2xl font-extrabold text-blue-700">{stats.financialStats.totalAccounts}</p>
                            <p className="text-xs text-gray-400 mt-1">Customer Accounts</p>
                        </div>
                        {(stats.financialStats?.txByType || []).map(tx => (
                            <div key={tx.name} className="bg-white p-5 rounded-xl shadow border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${tx.name === 'DEPOSIT' ? 'bg-green-100' : tx.name === 'WITHDRAWAL' ? 'bg-red-100' : 'bg-purple-100'}`}>
                                        {tx.name === 'DEPOSIT' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">{tx.name}</p>
                                </div>
                                <p className="text-xl font-extrabold text-gray-800">{parseFloat(tx.total).toLocaleString('en-UG')}</p>
                                <p className="text-xs text-gray-400 mt-1">UGX, {tx.count} transactions</p>
                            </div>
                        ))}
                    </div>

                    {/* Deposits vs Withdrawals Chart */}
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Deposits vs Withdrawals — Last 14 Days</h3>
                        <div className="h-64">
                            {stats.financialStats.txByDay.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-gray-400">No data yet.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.financialStats.txByDay}>
                                        <defs>
                                            <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="withdrawGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                        <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                                        <Area type="monotone" dataKey="deposits" stroke="#10B981" strokeWidth={2} fill="url(#depositGrad)" name="Deposits (UGX)" />
                                        <Area type="monotone" dataKey="withdrawals" stroke="#EF4444" strokeWidth={2} fill="url(#withdrawGrad)" name="Withdrawals (UGX)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── SECURITY SECTION ── */}
            <div className="border-l-4 border-primeBlue pl-3 mb-2">
                <h2 className="text-lg font-bold text-gray-800">Security Overview</h2>
                <p className="text-sm text-gray-500">Incident resolution and threat analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Incidents</h3>
                    <p className="text-3xl font-extrabold text-primeBlue mt-2">{stats.incidentStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Incidents Resolved</h3>
                    <p className="text-3xl font-extrabold text-green-600 mt-2">{stats.incidentStats.resolved}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-t-4 border-t-red-400">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Resolution Rate</h3>
                    <p className="text-3xl font-extrabold text-gray-800 mt-2">{stats.incidentStats.resolutionRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Threat Signatures by Type</h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.threatTypes}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#1455c6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Alert Breakdown by Severity</h3>
                    <div className="h-52 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.alertSeverity} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                                    {stats.alertSeverity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                        {stats.alertSeverity.map((entry, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-600">
                                <span className="w-2.5 h-2.5 rounded-full mr-1" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PDF Footer */}
            <div className="hidden print:block text-center text-gray-400 text-xs mt-12 pb-4 border-t border-gray-200 pt-4">
                Strictly Confidential • Generated by IREBAS — Intelligent Real-Time Bank Security Monitoring System
            </div>
        </div>
    );
};

export default Reports;
