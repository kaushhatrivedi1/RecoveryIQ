import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Intake from './pages/Intake';
import Journey from './pages/Journey';
import Clients from './pages/Clients';
import Devices from './pages/Devices';
import Pricing from './pages/Pricing';
import HackathonResources from './pages/HackathonResources';

function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('riq_auth');
  return auth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/hackathon" element={<HackathonResources />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/intake" element={<ProtectedRoute><Intake /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
          <Route path="/journey/:patientId" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
