import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertOctagon, ShieldX, UserPlus } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get('/api/security/alerts');
            setAlerts(res.data);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const investigateAlert = async (alert_id) => {
        try {
            await axios.post('/api/incidents', { alert_id });
            fetchAlerts(); // Refresh to show it is assigned
            alert("Incident escalated and assigned to you!");
        } catch (error) {
            alert("Failed to escalate: " + (error.response?.data?.message || error.message));
        }
    };

    const getSeverityBadge = (sev) => {
        const colors = {
            'CRITICAL': 'bg-red-100 text-red-800 border-red-200',
            'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
            'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'LOW': 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${colors[sev] || colors['LOW']}`}>{sev}</span>;
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-accentRed pl-3">Critical Alerts Action Center</h1>
                <p className="text-sm text-gray-500 mt-1">Unassigned security threats requiring human intervention.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {alerts.filter(a => a.status === 'NEW').map(alert => (
                    <div key={alert.id} className="bg-white rounded-lg shadow border-t-4 border-accentRed p-5 flex flex-col hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-gray-900 line-clamp-1" title={alert.title}>{alert.title}</h3>
                            {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-1">{alert.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                            <span>{new Date(alert.created_at).toLocaleTimeString()()}</span>
                            <button 
                                onClick={() => investigateAlert(alert.id)}
                                className="flex items-center text-primeBlue hover:text-primeBlueHover font-semibold bg-blue-50 px-3 py-1.5 rounded"
                            >
                                <UserPlus className="w-4 h-4 mr-1" /> Claim Ticket
                            </button>
                        </div>
                    </div>
                ))}
                
                {!loading && alerts.filter(a => a.status === 'NEW').length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                        <ShieldX className="w-16 h-16 mb-2 text-gray-300" />
                        <p>No new alerts. Firewall is secure.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
