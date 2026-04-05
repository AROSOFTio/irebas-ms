import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ClipboardList, CheckCircle2, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const severityBadge = (sev) => {
    switch (sev?.toUpperCase()) {
        case 'CRITICAL': return 'bg-red-100 text-red-700 border border-red-300';
        case 'HIGH':     return 'bg-orange-100 text-orange-700 border border-orange-300';
        case 'MEDIUM':   return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
        case 'LOW':      return 'bg-blue-100 text-blue-700 border border-blue-300';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const statusBadge = (st) => {
    switch (st) {
        case 'OPEN':        return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'IN_PROGRESS': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        case 'RESOLVED':    return 'bg-green-50 text-green-700 border border-green-200';
        case 'CLOSED':      return 'bg-gray-100 text-gray-500';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const Incidents = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const userRole = user?.role_name || user?.role || '';
    const canResolve = ['General Manager', 'Manager', 'System Security'].includes(userRole);
    const canSimulate = ['General Manager', 'Manager', 'System Security'].includes(userRole);

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);

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

    useEffect(() => { fetchIncidents(); }, []);

    const resolveIncident = async (id) => {
        try {
            await axios.put(`/api/incidents/${id}`, { status: 'RESOLVED', notes: 'Closed manually by analyst.' });
            addToast(`Incident #${id} resolved and alert status updated.`, 'success');
            fetchIncidents();
        } catch (error) {
            addToast('Failed to resolve incident.', 'error');
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const res = await axios.post('/api/incidents/simulate');
            addToast(`Incident simulated: "${res.data.alert.title}" [${res.data.alert.severity}]`, 'success');
            fetchIncidents();
        } catch (error) {
            addToast('Simulation failed.', 'error');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Incident Workspace</h1>
                    <p className="text-sm text-gray-500 mt-1">Actively managed threat investigations. {incidents.length} total incidents.</p>
                </div>
                {canSimulate && (
                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="flex items-center text-sm font-semibold px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition disabled:opacity-60"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        {simulating ? 'Simulating...' : 'Simulate Threat'}
                    </button>
                )}
            </div>

            <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alert / Threat</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading incidents...</td></tr>
                        ) : incidents.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No incidents found. Use "Simulate Threat" to generate one.
                            </td></tr>
                        ) : incidents.map((inc) => (
                            <tr key={inc.id} className={`hover:bg-gray-50 transition ${inc.status === 'RESOLVED' || inc.status === 'CLOSED' ? 'opacity-60' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-400">INC-{String(inc.id).padStart(4, '0')}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{inc.title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{inc.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${severityBadge(inc.severity)}`}>
                                        {inc.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusBadge(inc.status)}`}>
                                        {inc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {inc.assigned_user || <span className="italic text-gray-400">Unassigned</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                    {new Date(inc.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {canResolve && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' ? (
                                        <button
                                            onClick={() => resolveIncident(inc.id)}
                                            className="text-green-600 hover:text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-lg flex items-center text-xs font-bold transition"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Incidents;
