import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value !== null ? value : '...'}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{trend}</span>
            <span className="text-gray-400 ml-2">vs last week</span>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalAlarms: null,
        criticalAlerts: null,
        failedLogins: null,
        resolvedIncidents: null
    });
    const [chartData, setChartData] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('/api/dashboard/stats');
                setStats(res.data.stats);
                setChartData(res.data.chartData);
                setRecentAlerts(res.data.recentAlerts);
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
            case 'CRITICAL': return 'bg-red-100 text-accentRed';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-blue-100 text-primeBlue';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time overview of system security status.</p>
                </div>
                <button
                    onClick={() => navigate('/reports')}
                    className="btn-primary flex items-center bg-primeBlue text-white px-4 py-2 rounded shadow hover:bg-primeBlueHover transition text-sm font-semibold"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Report
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Alarms" value={stats.totalAlarms} icon={Bell} color="bg-primeBlue" trend="+12%" />
                <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={AlertTriangle} color="bg-accentRed" trend="-5%" />
                <StatCard title="Failed Logins" value={stats.failedLogins} icon={ShieldAlert} color="bg-orange-500" trend="+20%" />
                <StatCard title="Resolved Incidents" value={stats.resolvedIncidents} icon={CheckCircle} color="bg-emerald-500" trend="+2%" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Events Overview</h3>
                    <div className="h-72">
                        {loading && chartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-gray-400">Loading chart...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                    <Bar dataKey="alerts" fill="#1455c6" radius={[4, 4, 0, 0]} name="Alerts" />
                                    <Bar dataKey="incidents" fill="#b12917" radius={[4, 4, 0, 0]} name="Incidents" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Recent Activities List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Critical Alerts</h3>
                        <a href="/alerts" className="text-sm font-medium text-primeBlue hover:underline">View all</a>
                    </div>
                    <div className="space-y-4">
                        {recentAlerts.length === 0 && !loading && (
                            <div className="text-sm text-gray-500">No recent alerts found.</div>
                        )}
                        {recentAlerts.slice(0,4).map((alert) => (
                            <div key={alert.id} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="mt-0.5 bg-red-100 p-2 rounded-full mr-3">
                                    <AlertTriangle className="w-4 h-4 text-accentRed" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 truncate" title={alert.title}>{alert.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Status: {alert.status}</p>
                                </div>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">
                                    {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Recent Alerts Table placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Latest Active Alerts</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                                </tr>
                            ) : recentAlerts.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primeBlue">ALT-{row.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityColor(row.severity)}`}>
                                            {row.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {row.status}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(row.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-primeBlue hover:text-primeBlueHover">Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
