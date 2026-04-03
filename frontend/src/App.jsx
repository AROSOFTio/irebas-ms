import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
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
      </Routes>
    </Router>
  );
}

export default App;
