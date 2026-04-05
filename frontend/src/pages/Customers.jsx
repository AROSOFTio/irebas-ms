import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Wallet } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Customers = () => {
    const { addToast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', first_name: '', last_name: '' });

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('/api/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/customers', formData);
            setShowModal(false);
            setFormData({ username: '', password: '', first_name: '', last_name: '' });
            fetchCustomers();
            addToast(`Account opened for ${formData.first_name} ${formData.last_name} successfully.`, 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to create customer account.', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Customer Accounts</h1>
                    <p className="text-sm text-gray-500 mt-1">Provision and view official banking customers.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center text-sm font-semibold px-4 py-2 bg-primeBlue text-white rounded shadow hover:bg-primeBlueHover transition"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Provision Customer
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance (UGX)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created On</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-800">
                                        <Wallet className="w-4 h-4"/>
                                    </div>
                                    {customer.first_name} {customer.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">@{customer.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50 px-2 rounded">
                                    {customer.account_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                                    {parseFloat(customer.balance).toLocaleString('en-US')} UGX
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(customer.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Open Customer Account</h2>
                        <form onSubmit={handleCreate}>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                                    <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primeBlue" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                                    <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primeBlue" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Username (For App Login)</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primeBlue" />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Temporary PIN/Password</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primeBlue" />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition">Cancel</button>
                                <button type="submit" className="px-5 py-2 text-white bg-primeBlue hover:bg-primeBlueHover rounded font-medium shadow transition flex items-center">
                                    Open Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
