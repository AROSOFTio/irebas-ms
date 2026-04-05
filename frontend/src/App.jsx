import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

function App() {
  return (
    <AuthProvider>
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
                <RoleRoute allowedRoles={['General Manager', 'Manager']}><Reports /></RoleRoute>
              } />
              <Route path="/users" element={
                <RoleRoute allowedRoles={['General Manager', 'Manager']}><Users /></RoleRoute>
              } />
              <Route path="/settings" element={
                <RoleRoute allowedRoles={['General Manager']}><Settings /></RoleRoute>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
