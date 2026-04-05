import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Send, Key } from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    
    const [activeModal, setActiveModal] = useState(null); // 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'
    const [amount, setAmount] = useState('');
    const [destination, setDestination] = useState('');

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
        
        // Listen for new transactions locally
        const socket = window.io?.('/', { path: '/socket.io' });
        if (socket) {
             socket.on('new_transaction', (newTx) => {
                 if (newTx.customer_id === user.id) {
                     fetchData(); // Refresh to catch new balance
                 }
             });
             return () => socket.disconnect();
        }
    }, [user]);

    const handleTransaction = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: activeModal,
                amount: parseFloat(amount),
            };
            if (activeModal === 'TRANSFER') {
                payload.destination_account = destination;
            }

            await axios.post('/api/transactions/perform', payload);
            alert(`${activeModal} successful!`);
            setActiveModal(null);
            setAmount('');
            setDestination('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Transaction failed');
        }
    };

    if (!profile) return <div>Loading account...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">My Bank Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Account Balance Card */}
                <div className="md:col-span-2 bg-gradient-to-r from-primeBlue to-blue-800 rounded-xl shadow-lg p-8 text-white flex flex-col justify-between">
                    <div>
                        <p className="text-blue-200 font-medium tracking-wider uppercase text-sm mb-1">Available Balance</p>
                        <h2 className="text-5xl font-extrabold">{parseFloat(profile.balance).toLocaleString('en-US')} <span className="text-2xl font-semibold opacity-80">UGX</span></h2>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-200 mb-1">Account Holder</p>
                            <p className="font-bold text-lg">{profile.first_name} {profile.last_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200 mb-1">Account Number</p>
                            <p className="font-mono bg-white/20 px-3 py-1 rounded-md tracking-widest">{profile.account_number}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-center space-y-4">
                    <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Quick Actions</h3>
                    
                    <button onClick={() => setActiveModal('DEPOSIT')} className="flex items-center text-left p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition w-full font-bold">
                        <ArrowDownCircle className="w-5 h-5 mr-3" />
                        Deposit Funds
                    </button>
                    
                    <button onClick={() => setActiveModal('WITHDRAWAL')} className="flex items-center text-left p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition w-full font-bold">
                        <ArrowUpCircle className="w-5 h-5 mr-3" />
                        Withdraw Funds
                    </button>
                    
                    <button onClick={() => setActiveModal('TRANSFER')} className="flex items-center text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition w-full font-bold">
                        <Send className="w-5 h-5 mr-3" />
                        Send Transfer
                    </button>
                </div>

            </div>

            {/* Transaction History */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 mt-8">
                 <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
                    <History className="w-5 h-5 text-gray-500 mr-2"/>
                    <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                 </div>
                 <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr><td className="p-6 text-center text-gray-500">No transactions found.</td></tr>
                        ) : transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {tx.transaction_type === 'DEPOSIT' && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-xs">DEPOSIT</span>}
                                    {tx.transaction_type === 'WITHDRAWAL' && <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-xs">WITHDRAWAL</span>}
                                    {tx.transaction_type === 'TRANSFER' && <span className="text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full text-xs">TRANSFER</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(tx.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                                   <span className={tx.transaction_type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-800'}>
                                        {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en-US')} UGX
                                   </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>

            {/* Modals */}
            {activeModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center capitalize">
                            {activeModal.toLowerCase()} Config
                        </h2>
                        <form onSubmit={handleTransaction}>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Amount (UGX)</label>
                                <input required type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primeBlue" placeholder="e.g. 50000" />
                            </div>

                            {activeModal === 'TRANSFER' && (
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Destination Account #</label>
                                    <input required type="text" value={destination} onChange={e => setDestination(e.target.value)} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primeBlue" placeholder="10-digit account" />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primeBlue hover:bg-primeBlueHover rounded font-medium shadow transition">
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Need History icon import, doing it inline above
import { History as HistoryIcon } from 'lucide-react';
// Fix the History usage above to be HistoryIcon
const History = HistoryIcon;

export default CustomerDashboard;
