import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserPlus, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Users = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ 
        username: '', 
        password: '', 
        first_name: '',
        last_name: '',
        designation: '',
        staff_id: '',
        role_id: 3 
    });

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
            setFormData({ username: '', password: '', first_name: '', last_name: '', designation: '', staff_id: '', role_id: 3 });
            fetchUsers();
            addToast(`Staff member ${formData.first_name} ${formData.last_name} created successfully.`, 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to create staff member.', 'error');
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
                    Create Staff
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation & ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.designation}</div>
                                    <div className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-1 rounded">{user.staff_id}</div>
                                </td>
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
                    <div className="bg-white p-6 justify-center rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Create New Staff</h2>
                        <form onSubmit={handleCreate}>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                                    <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                                    <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Designation</label>
                                    <input required type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Staff ID</label>
                                    <input required type="text" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">App Username</label>
                                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Temporary Password</label>
                                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primeBlue" />
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">System Role</label>
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
                                <button type="submit" className="px-4 py-2 text-white bg-primeBlue hover:bg-primeBlueHover rounded">Create Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
