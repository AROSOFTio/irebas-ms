import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ClipboardList, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Incidents = () => {
    const { user } = useContext(AuthContext);
    const userRole = user?.role_name || user?.role || '';
    const canResolve = ['Admin', 'Security Analyst'].includes(userRole);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIncidents = async () => {
        try {
            const res = await axios.get('/api/incidents');
            setIncidents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const resolveIncident = async (id) => {
        if (!confirm("Close this incident and update the original alert status?")) return;
        try {
            await axios.put(`/api/incidents/${id}`, { status: 'RESOLVED', notes: 'Closed manually by analyst.' });
            fetchIncidents();
        } catch (error) {
            alert("Failed to resolve");
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Incident Workspace</h1>
                <p className="text-sm text-gray-500 mt-1">Actively managed threat investigations.</p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Alert</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {incidents.map((inc) => (
                            <tr key={inc.id} className={inc.status === 'RESOLVED' ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-primeBlue text-white flex items-center justify-center font-bold mr-3 shadow-inner">
                                            {inc.assigned_user ? inc.assigned_user[0] : '?'}
                                        </div>
                                        {inc.assigned_user}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{inc.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        {inc.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${inc.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {inc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {inc.status !== 'RESOLVED' && canResolve ? (
                                        <button 
                                            onClick={() => resolveIncident(inc.id)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md flex items-center"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1"/> Resolve
                                        </button>
                                    ) : inc.status !== 'RESOLVED' ? (
                                        <span className="text-gray-400 italic text-xs">View only</span>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                        {incidents.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No active incidents.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Incidents;
