import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('/api/audit-logs');
                setLogs(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6 border-b pb-4">
                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                    <History className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">Review historical administrative and system actions</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Action</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Module / Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.created_at).toLocaleDateString()}, {new Date(log.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{log.first_name ? `${log.first_name} ${log.last_name}` : 'System / Unknown'}</div>
                                    <div className="text-xs text-gray-500">@{log.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <strong>{log.module}</strong> <span className="text-gray-400 mx-1">&rarr;</span> {log.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
