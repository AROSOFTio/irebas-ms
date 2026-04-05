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
    
    // Strict RBAC: Only System Security Analyst can resolve
    const canResolve  = userRole === 'System Security Analyst' || userRole === 'System Security';
    
    // Top Management + SSA can simulate
    const canSimulate = ['General Manager', 'Manager', 'System Security Analyst', 'System Security'].includes(userRole);

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
            await axios.put(`/api/incidents/${id}`, { status: 'RESOLVED', notes: 'Closed manually by Security Analyst.' });
            addToast(`Incident #${id} successfully resolved.`, 'success');
            fetchIncidents();
        } catch (error) {
            addToast('Resolution failed. Unauthorized access.', 'error');
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const res = await axios.post('/api/incidents/simulate');
            addToast(`Simulation: ${res.data.alert.title}`, 'success');
            fetchIncidents();
        } catch (error) {
            addToast('Simulation deployment failed.', 'error');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-4">Incident Workspace</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Live Threat Investigation Queue</p>
                </div>
                {canSimulate && (
                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="flex items-center text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-orange-600 text-white rounded-xl shadow-xl hover:bg-orange-700 transition disabled:opacity-60"
                    >
                        <Zap className="w-3.5 h-3.5 mr-2" />
                        {simulating ? 'Deploying...' : 'Simulate Threat'}
                    </button>
                )}
            </div>

            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Ref ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Classification / Threat</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Assigned</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse">Scanning incident queue...</td></tr>
                        ) : incidents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                                    <ClipboardList className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                    <p className="font-black uppercase tracking-widest">No Active Incidents Detected</p>
                                </td>
                            </tr>
                        ) : incidents.map((inc) => (
                            <tr key={inc.id} className={`hover:bg-gray-50/50 transition ${inc.status === 'RESOLVED' ? 'opacity-50 grayscale' : ''}`}>
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-mono font-black text-gray-400">INC-{String(inc.id).padStart(4, '0')}</td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-black text-gray-900 leading-tight">{inc.title}</div>
                                    <div className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-md">{inc.description}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${severityBadge(inc.severity)}`}>
                                        {inc.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase ${statusBadge(inc.status)}`}>
                                        {inc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-gray-600">
                                    {inc.assigned_user || <span className="italic text-gray-300">Unassigned</span>}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    {canResolve && inc.status !== 'RESOLVED' ? (
                                        <button
                                            onClick={() => resolveIncident(inc.id)}
                                            className="text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg flex items-center text-[10px] font-black uppercase transition-all shadow-md active:scale-95"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Resolve
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-[10px] font-black uppercase italic tracking-widest">— Restricted —</span>
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
