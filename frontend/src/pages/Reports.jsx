import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DownloadCloud, Wallet, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const COLORS = ['#0a2355', '#EF4444', '#F59E0B', '#10B981', '#6366F1'];

const Reports = () => {
    const { user } = useContext(AuthContext);
    const userRole = user?.role_name || user?.role || '';
    
    // Permission Groups
    const isTopManagement = ['General Manager', 'Manager'].includes(userRole);
    const isSecurityAdmin  = ['General Manager', 'Manager', 'System Security Analyst'].includes(userRole);

    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/reports/summary');
                setStats(res.data);
            } catch (error) {
                console.error("Report fetch failed", error);
            }
        };
        fetchStats();
    }, []);

    const exportPDF = () => window.print();

    if (!stats) return <div className="text-gray-400 text-center py-20 font-bold animate-pulse uppercase tracking-widest">Generating System Metrics...</div>;

    return (
        <div className="print:m-0 print:p-0 space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 border-l-4 border-[#0a2355] pl-4">Institutional Reports</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Classification: {isTopManagement ? 'Confidential - Financial' : 'Security Only'}</p>
                </div>
                <button onClick={exportPDF} className="flex items-center text-xs font-bold px-5 py-2.5 bg-[#0a2355] text-white rounded-xl shadow-xl hover:bg-blue-900 transition">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export Document
                </button>
            </div>

            {/* ── FINANCIAL SECTION (General Manager & Manager Only) ── */}
            {isTopManagement && (
                <div className="space-y-6">
                    <div className="border-b border-gray-100 pb-2">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Financial Ledger Performance</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-50 rounded-lg"><Wallet className="w-4 h-4 text-emerald-600" /></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Liquidity</p>
                            </div>
                            <p className="text-2xl font-black text-emerald-700">{(stats.financialStats?.totalBalance || 0).toLocaleString('en-UG')}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">UGX Consolidated</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Portfolio</p>
                            </div>
                            <p className="text-2xl font-black text-blue-700">{stats.financialStats?.totalAccounts || 0}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Verified Accounts</p>
                        </div>

                        {(stats.financialStats?.txByType || []).map(tx => (
                            <div key={tx.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${tx.name === 'DEPOSIT' ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {tx.name === 'DEPOSIT' ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tx.name}</p>
                                </div>
                                <p className="text-xl font-black text-gray-800">{parseFloat(tx.total).toLocaleString('en-UG')}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">{tx.count} Entries</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Capital Flow — 14 Day Variance</h3>
                        <div className="h-64">
                            {stats.financialStats?.txByDay?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-300 italic font-bold">Trendline Unavailable</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.financialStats.txByDay}>
                                        <defs>
                                            <linearGradient id="depo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="with" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                                        <Area type="monotone" dataKey="deposits" stroke="#10B981" fillOpacity={1} fill="url(#depo)" strokeWidth={3} name="Deposits" />
                                        <Area type="monotone" dataKey="withdrawals" stroke="#EF4444" fillOpacity={1} fill="url(#with)" strokeWidth={3} name="Withdrawals" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── SECURITY SECTION (GM, Manager, SSA) ── */}
            {isSecurityAdmin && (
                <div className="space-y-6">
                    <div className="border-b border-gray-100 pb-2">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Strategic Security Metrics</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-[#0a2355] p-7 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-5xl text-white italic">INC</div>
                            <h3 className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Incidents</h3>
                            <p className="text-4xl font-black text-white">{stats.incidentStats?.total || 0}</p>
                        </div>
                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Resolved Status</h3>
                            <p className="text-4xl font-black text-green-600">{stats.incidentStats?.resolved || 0}</p>
                        </div>
                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Success Ratio</h3>
                            <p className="text-4xl font-black text-gray-800">{stats.incidentStats?.resolutionRate || 0}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Threat Signature Distribution</h3>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.threatTypes}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                                        <Bar dataKey="value" fill="#0a2355" radius={[6,6,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 self-start">Severity Breakdown</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.alertSeverity} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                                            {stats.alertSeverity?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6">
                                {stats.alertSeverity?.map((entry, idx) => (
                                    <div key={idx} className="flex items-center text-[10px] font-bold text-gray-500 uppercase">
                                        <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                                        {entry.name}: {entry.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
