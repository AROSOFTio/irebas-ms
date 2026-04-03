import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

const SecurityEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/security/events');
            setEvents(res.data);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // Optional: auto-refresh every 5 seconds
        const interval = setInterval(fetchEvents, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Raw Security Log</h1>
                    <p className="text-sm text-gray-500 mt-1">Live feed of all system threat detections and anomalies.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm text-sm font-medium text-gray-600">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Listening for signals
                </div>
            </div>

            <div className="flex-1 bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800 flex flex-col font-mono">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex text-xs font-semibold text-gray-400">
                    <div className="w-1/4">TIMESTAMP</div>
                    <div className="w-1/4">EVENT TYPE</div>
                    <div className="w-1/4">SOURCE IP</div>
                    <div className="w-1/4">DETAILS</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {loading && events.length === 0 ? (
                        <div className="text-gray-500">Loading stream...</div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="flex text-sm hover:bg-white/5 px-2 py-1 -mx-2 rounded transition">
                                <div className="w-1/4 text-gray-500">
                                    {new Date(event.created_at).toLocaleString()}
                                </div>
                                <div className="w-1/4 flex items-center gap-2">
                                    {event.event_type.includes('TRANSFER') ? <Activity className="w-4 h-4 text-accentRed" /> : <Cpu className="w-4 h-4 text-primeBlue" />}
                                    <span className="text-green-400 font-bold">{event.event_type}</span>
                                </div>
                                <div className="w-1/4 text-blue-300">{event.ip_address}</div>
                                <div className="w-1/4 text-gray-300 truncate" title={event.description}>{event.description}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityEvents;
