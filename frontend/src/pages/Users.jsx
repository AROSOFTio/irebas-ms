import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserPlus, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Users = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role_id: 2 });

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', formData);
            setShowModal(false);
            setFormData({ username: '', password: '', role_id: 2 });
            fetchUsers();
            alert("Staff member provisioned successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create user");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primeBlue pl-3">Staff Administration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system access and analyst roles.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center text-sm font-semibold px-4 py-2 bg-primeBlue text-white rounded shadow hover:bg-primeBlueHover transition"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Provision Staff
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                                    {user.role === 'General Manager' ? <Shield className="w-4 h-4 mr-1 text-accentRed" /> : null}
                                    {user.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                    <div className="bg-white p-6 justify-center rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Provision New Staff</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Temporary Password</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                                <select value={formData.role_id} onChange={e => setFormData({...formData, role_id: parseInt(e.target.value)})} className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-white">
                                    {currentUser?.role_name === 'General Manager' && <option value={1}>General Manager</option>}
                                    {currentUser?.role_name === 'General Manager' && <option value={2}>Manager</option>}
                                    <option value={3}>System Security</option>
                                    <option value={4}>Front Desk</option>
                                    <option value={5}>IT Officer</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primeBlue hover:bg-primeBlueHover rounded">Provision</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
