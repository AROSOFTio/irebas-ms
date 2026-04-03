import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldX } from 'lucide-react';

/**
 * RoleRoute - Wraps children and only renders if
 * the logged-in user's role is in `allowedRoles`.
 * Otherwise renders an Access Denied page.
 */
const RoleRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role_name || user.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="bg-red-50 border border-accentRed rounded-xl p-10 max-w-md w-full mx-auto shadow">
                    <ShieldX className="w-14 h-14 text-accentRed mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 text-sm">
                        Your role <span className="font-semibold text-primeBlue">({user.role_name || user.role})</span> does not have permission to view this page.
                    </p>
                    <p className="text-gray-400 text-xs mt-4">Required: {allowedRoles.join(', ')}</p>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleRoute;
