import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SecurityEvents from './pages/SecurityEvents';
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<SecurityEvents />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reports" element={<div className="p-6 h-full font-semibold text-2xl">Reports (Coming Soon)</div>} />
              <Route path="/settings" element={<div className="p-6 h-full font-semibold text-2xl">Settings (Coming Soon)</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
