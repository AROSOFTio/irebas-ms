import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Send, History, TrendingUp, TrendingDown } from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [amount, setAmount] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [profileRes, txRes] = await Promise.all([
                axios.get('/api/customers/me'),
                axios.get('/api/transactions/me')
            ]);
            setProfile(profileRes.data);
            setTransactions(txRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        const socket = io('/', { path: '/socket.io' });
        socket.on('new_transaction', (newTx) => {
            if (newTx.customer_id === user?.id) fetchData();
        });
        return () => socket.disconnect();
    }, [user]);

    const handleTransaction = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { type: activeModal, amount: parseFloat(amount) };
            if (activeModal === 'TRANSFER') payload.destination_account = destination;

            await axios.post('/api/transactions/perform', payload);

            const messages = {
                DEPOSIT: `UGX ${parseFloat(amount).toLocaleString()} deposited to your account.`,
                WITHDRAWAL: `UGX ${parseFloat(amount).toLocaleString()} withdrawn from your account.`,
                TRANSFER: `UGX ${parseFloat(amount).toLocaleString()} transferred to account ${destination}.`,
            };
            addToast(messages[activeModal], 'success');
            setActiveModal(null);
            setAmount('');
            setDestination('');
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Transaction failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-primeBlue border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-500 font-medium">Loading your account...</p>
            </div>
        </div>
    );

    const totalDeposited = transactions.filter(t => t.transaction_type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalWithdrawn = transactions.filter(t => t.transaction_type !== 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, <span className="text-primeBlue">{profile.first_name}</span></h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account and review your transactions.</p>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Account Active
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Balance Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#0a2355] to-[#1455c6] rounded-2xl shadow-xl p-8 text-white flex flex-col justify-between min-h-[180px]">
                    <div>
                        <p className="text-blue-200 font-semibold tracking-widest uppercase text-xs mb-2">Available Balance</p>
                        <h2 className="text-5xl font-extrabold tracking-tight">
                            {parseFloat(profile.balance).toLocaleString('en-UG')}
                            <span className="text-xl font-semibold opacity-70 ml-2">UGX</span>
                        </h2>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                        <div>
                            <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider">Account Holder</p>
                            <p className="font-bold text-lg">{profile.first_name} {profile.last_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider">Account Number</p>
                            <p className="font-mono bg-white/15 border border-white/20 px-3 py-1.5 rounded-lg tracking-widest text-sm">
                                {profile.account_number}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Column */}
                <div className="flex flex-col gap-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Deposited</p>
                            <p className="text-lg font-extrabold text-green-700">+{totalDeposited.toLocaleString('en-UG')} UGX</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Withdrawn</p>
                            <p className="text-lg font-extrabold text-red-700">-{totalWithdrawn.toLocaleString('en-UG')} UGX</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setActiveModal('DEPOSIT')}
                        className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-green-100 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 transition font-bold">
                        <ArrowDownCircle className="w-7 h-7" />
                        <span className="text-sm">Deposit</span>
                    </button>
                    <button onClick={() => setActiveModal('WITHDRAWAL')}
                        className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition font-bold">
                        <ArrowUpCircle className="w-7 h-7" />
                        <span className="text-sm">Withdraw</span>
                    </button>
                    <button onClick={() => setActiveModal('TRANSFER')}
                        className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition font-bold">
                        <Send className="w-7 h-7" />
                        <span className="text-sm">Transfer</span>
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white shadow rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                        <History className="w-5 h-5 text-gray-500 mr-2" />
                        <h3 className="text-base font-bold text-gray-800">Transaction History</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{transactions.length} records</span>
                </div>
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {transactions.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">No transactions yet. Make your first deposit!</td></tr>
                        ) : transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {tx.transaction_type === 'DEPOSIT' && <span className="text-green-600 font-bold bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs">DEPOSIT</span>}
                                    {tx.transaction_type === 'WITHDRAWAL' && <span className="text-red-600 font-bold bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs">WITHDRAWAL</span>}
                                    {tx.transaction_type === 'TRANSFER' && <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs">TRANSFER</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(tx.created_at).toLocaleDateString()}, {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {tx.destination_account ? `→ Acct ${tx.destination_account}` : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-base">
                                    <span className={tx.transaction_type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}>
                                        {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en-UG')} UGX
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Transaction Modal */}
            {activeModal && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="flex items-center mb-6 pb-4 border-b">
                            {activeModal === 'DEPOSIT' && <ArrowDownCircle className="w-6 h-6 text-green-600 mr-3" />}
                            {activeModal === 'WITHDRAWAL' && <ArrowUpCircle className="w-6 h-6 text-red-600 mr-3" />}
                            {activeModal === 'TRANSFER' && <Send className="w-6 h-6 text-blue-600 mr-3" />}
                            <h2 className="text-xl font-bold text-gray-800 capitalize">{activeModal.charAt(0) + activeModal.slice(1).toLowerCase()}</h2>
                        </div>
                        <form onSubmit={handleTransaction}>
                            <div className="mb-5">
                                <label className="block text-gray-600 text-sm font-semibold mb-2">Amount (UGX)</label>
                                <input required type="number" min="1" step="1" value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="border-2 border-gray-200 focus:border-primeBlue rounded-xl w-full py-3 px-4 text-gray-800 text-xl font-bold focus:outline-none transition"
                                    placeholder="0" />
                            </div>
                            {activeModal === 'TRANSFER' && (
                                <div className="mb-5">
                                    <label className="block text-gray-600 text-sm font-semibold mb-2">Recipient Account Number</label>
                                    <input required type="text" value={destination}
                                        onChange={e => setDestination(e.target.value)}
                                        className="border-2 border-gray-200 focus:border-primeBlue rounded-xl w-full py-3 px-4 text-gray-800 font-mono focus:outline-none transition"
                                        placeholder="10-digit account number" />
                                </div>
                            )}
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => { setActiveModal(null); setAmount(''); setDestination(''); }}
                                    className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 text-white bg-primeBlue hover:bg-primeBlueHover rounded-xl font-bold shadow transition disabled:opacity-70">
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
