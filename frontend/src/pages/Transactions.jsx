import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Activity, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, MapPin, MonitorSmartphone } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        deposits: 0,
        withdrawals: 0,
        transfers: 0
    });

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('/api/transactions');
            setTransactions(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            deposits: data.filter(t => t.transaction_type === 'DEPOSIT').length,
            withdrawals: data.filter(t => t.transaction_type === 'WITHDRAWAL').length,
            transfers: data.filter(t => t.transaction_type === 'TRANSFER').length
        });
    };

    useEffect(() => {
        fetchTransactions();

        const socket = io(`http://${window.location.hostname}:5005`);
        
        socket.on('new_transaction', (newTx) => {
            setTransactions(prev => {
                const updated = [newTx, ...prev];
                // Keep only top 100 to prevent memory leak
                if (updated.length > 100) updated.pop();
                calculateStats(updated);
                return updated;
            });
        });

        return () => socket.disconnect();
    }, []);

    const simulateTransaction = async () => {
        try {
            await axios.post('/api/transactions/simulate');
        } catch (error) {
            console.error("Failed to simulate", error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownCircle className="text-green-500 w-5 h-5" />;
            case 'WITHDRAWAL': return <ArrowUpCircle className="text-red-500 w-5 h-5" />;
            case 'TRANSFER': return <ArrowRightLeft className="text-blue-500 w-5 h-5" />;
            default: return <Activity className="text-gray-500 w-5 h-5" />;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Transaction Monitoring</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time tracking of deposits, withdrawals, and transfers.</p>
                </div>
                <button 
                    onClick={simulateTransaction}
                    className="flex items-center text-sm font-semibold px-4 py-2 bg-primeBlue text-white rounded shadow hover:bg-primeBlueHover transition"
                >
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Simulate Event
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Analyzed (Last 100)</p>
                        <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <ArrowDownCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Deposits</p>
                        <p className="text-xl font-bold text-gray-800">{stats.deposits}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <ArrowUpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Withdrawals</p>
                        <p className="text-xl font-bold text-gray-800">{stats.withdrawals}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Transfers</p>
                        <p className="text-xl font-bold text-gray-800">{stats.transfers}</p>
                    </div>
                </div>
            </div>

            {/* Real-time Stream Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 relative">
                <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (USD)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location & IP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No transactions recorded yet.</td>
                            </tr>
                        ) : (
                            transactions.map((tx, idx) => (
                                <tr key={tx.id || idx} className={`hover:bg-gray-50 transition ${idx === 0 ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getTypeIcon(tx.transaction_type)}
                                            <span className="ml-2 text-sm font-bold text-gray-900">{tx.transaction_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                            {tx.location_geo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{tx.location_ip}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600 flex items-center">
                                            <MonitorSmartphone className="w-4 h-4 mr-1 text-gray-400"/>
                                            {tx.device_used}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(tx.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;
