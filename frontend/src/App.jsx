import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SecurityEvents from './pages/SecurityEvents';
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import CustomerDashboard from './pages/customer/CustomerDashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<SecurityEvents />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/audit-logs" element={
                <RoleRoute allowedRoles={['General Manager', 'Manager', 'System Security']}><AuditLogs /></RoleRoute>
              } />
              <Route path="/reports" element={
                <RoleRoute allowedRoles={['General Manager', 'Manager', 'System Security']}><Reports /></RoleRoute>
              } />
              <Route path="/users" element={
                <RoleRoute allowedRoles={['General Manager', 'Manager', 'System Security']}><Users /></RoleRoute>
              } />
              <Route path="/customers" element={
                <RoleRoute allowedRoles={['General Manager', 'Manager', 'System Security']}><Customers /></RoleRoute>
              } />
              <Route path="/settings" element={
                <RoleRoute allowedRoles={['General Manager', 'System Security']}><Settings /></RoleRoute>
              } />
              <Route path="/customer/dashboard" element={
                <RoleRoute allowedRoles={['Customer']}><CustomerDashboard /></RoleRoute>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
