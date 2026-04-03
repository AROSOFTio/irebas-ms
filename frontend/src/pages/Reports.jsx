import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DownloadCloud } from 'lucide-react';

const COLORS = ['#1455c6', '#E53A40', '#F59E0B', '#10B981', '#6366F1'];

const Reports = () => {
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

    const exportPDF = () => {
        window.print();
    };

    if (!stats) return <div className="text-gray-500">Loading metrics...</div>;

    return (
        <div className="print:m-0 print:p-0">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Executive Reporting</h1>
                    <p className="text-sm text-gray-500 mt-1">Exportable PDF Security Bulletins.</p>
                </div>
                <button 
                    onClick={exportPDF}
                    className="flex items-center text-sm font-semibold px-4 py-2 bg-primeBlue text-white rounded shadow hover:bg-primeBlueHover transition"
                >
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export PDF
                </button>
            </div>

            {/* Print Only Header (Hidden on Web) */}
            <div className="hidden print:flex justify-between items-end border-b-2 border-primeBlue pb-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-primeBlue">MONTHLY SECURITY RUNBOOK</h1>
                    <p className="text-gray-500 font-mono mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <img src="/logo.png" className="h-12 object-contain" alt="Logo" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 print:shadow-none print:border-gray-300">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Raised Incidents</h3>
                    <p className="text-3xl font-bold text-primeBlue mt-2">{stats.incidentStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 print:shadow-none print:border-gray-300">
                    <h3 className="text-gray-500 text-sm font-semibold">Incidents Resolved</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.incidentStats.resolved}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-t-4 border-t-accentRed print:shadow-none print:border-gray-300">
                    <h3 className="text-gray-500 text-sm font-semibold">Resolution Health Rate</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.incidentStats.resolutionRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 print:shadow-none print:border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-sans">Threat Signatures</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.threatTypes}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#1455c6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 print:shadow-none print:border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-sans">Alert Breakdown by Severity</h3>
                    <div className="h-64 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.alertSeverity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.alertSeverity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {stats.alertSeverity.map((entry, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-600">
                                <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="hidden print:block text-center text-gray-400 text-xs mt-12 pb-4 border-t border-gray-200 pt-4">
                Strictly Confidential. Generated by Intelligent Real-Time Bank Security Monitoring System (IREBAS).
            </div>
        </div>
    );
};

export default Reports;
