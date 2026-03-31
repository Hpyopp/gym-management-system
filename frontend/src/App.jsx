import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import POS from './pages/POS'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/super-secret-admin" element={<SuperAdmin />} /> 
        <Route path="/pos" element={<POS />} /> 
      </Routes>
    </Router>
  );
}

export default App;