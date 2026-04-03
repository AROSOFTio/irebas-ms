import React from 'react';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', alerts: 12, incidents: 2 },
    { name: 'Tue', alerts: 19, incidents: 4 },
    { name: 'Wed', alerts: 5, incidents: 1 },
    { name: 'Thu', alerts: 14, incidents: 3 },
    { name: 'Fri', alerts: 22, incidents: 6 },
    { name: 'Sat', alerts: 7, incidents: 0 },
    { name: 'Sun', alerts: 4, incidents: 0 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
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
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time overview of system security status.</p>
                </div>
                <button className="btn-primary flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Report
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Alarms" value="234" icon={Bell} color="bg-primeBlue" trend="+12%" />
                <StatCard title="Critical Alerts" value="18" icon={AlertTriangle} color="bg-accentRed" trend="-5%" />
                <StatCard title="Failed Logins" value="45" icon={ShieldAlert} color="bg-orange-500" trend="+20%" />
                <StatCard title="Resolved Incidents" value="112" icon={CheckCircle} color="bg-emerald-500" trend="+2%" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Events Overview</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="alerts" fill="#1455c6" radius={[4, 4, 0, 0]} name="Alerts" />
                                <Bar dataKey="incidents" fill="#b12917" radius={[4, 4, 0, 0]} name="Incidents" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activities List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Critical Alerts</h3>
                        <a href="/alerts" className="text-sm font-medium text-primeBlue hover:underline">View all</a>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="mt-0.5 bg-red-100 p-2 rounded-full mr-3">
                                    <AlertTriangle className="w-4 h-4 text-accentRed" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Multiple failed logins</h4>
                                    <p className="text-xs text-gray-500 mt-1">IP: 192.168.1.{100 + i}</p>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">10 min ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Recent Alerts Table placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Latest Active Incidents</h3>
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
                            {[
                                { id: 'INC-1024', title: 'Suspicious overseas login', severity: 'High', status: 'Open' },
                                { id: 'INC-1023', title: 'Brute force attempt detected', severity: 'Critical', status: 'In Progress' },
                                { id: 'INC-1022', title: 'Unauthorized file access', severity: 'Medium', status: 'Open' },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primeBlue">{row.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-accentRed`}>
                                            {row.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Today, 10:45 AM</td>
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
