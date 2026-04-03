import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

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
              <Route path="/events" element={<div className="p-6 h-full font-semibold text-2xl">Security Events (Coming Soon)</div>} />
              <Route path="/alerts" element={<div className="p-6 h-full font-semibold text-2xl">Alerts (Coming Soon)</div>} />
              <Route path="/incidents" element={<div className="p-6 h-full font-semibold text-2xl">Incidents (Coming Soon)</div>} />
              <Route path="/audit-logs" element={<div className="p-6 h-full font-semibold text-2xl">Audit Logs (Coming Soon)</div>} />
              <Route path="/reports" element={<div className="p-6 h-full font-semibold text-2xl">Reports (Coming Soon)</div>} />
              <Route path="/users" element={<div className="p-6 h-full font-semibold text-2xl">Users (Coming Soon)</div>} />
              <Route path="/settings" element={<div className="p-6 h-full font-semibold text-2xl">Settings (Coming Soon)</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
