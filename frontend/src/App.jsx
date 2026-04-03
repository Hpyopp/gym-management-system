import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import POS from './pages/POS'; 
import Pricing from './pages/Pricing'; 
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';

// 🔥 THE BULLETPROOF GUARD 🔥
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // e.g., 'admin', 'user', 'superadmin', 'staff'

  // Agar token nahi hai, toh bhagao isko Login page pe
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Agar role match nahi karta (e.g. Member trying to access Admin page)
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("Access Denied: You don't have permission to view this page.");
    return <Navigate to="/" replace />; // Ya koi 'Unauthorized' page pe bhej do
  }

  // Agar sab theek hai, toh andar jaane do
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (Koi bhi dekh sakta hai) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* 🛡️ PROTECTED ROUTES (Bina Token / Role ke Entry Banned) 🛡️ */}
        
        <Route path="/superadmin" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdmin />
          </ProtectedRoute>
        } /> 

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Admin />
          </ProtectedRoute>
        } /> 

        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <POS />
          </ProtectedRoute>
        } /> 

        <Route path="/staff-dashboard" element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/:userId" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* 404 FALLBACK ROUTE: Agar koi aisi link dale jo hai hi nahi */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
            <h1>404 - Page Not Found</h1>
          </div>
        } />

      </Routes>
    </Router>
  );
}

export default App;