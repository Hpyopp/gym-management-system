import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://gym-management-system-ngbu.onrender.com/api/staff/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'staff');
      navigate('/staff-dashboard'); // Login hote hi yahan bhejenge
    } catch (err) {
      alert("Invalid Staff Credentials!");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #10b981', width: '350px', textAlign: 'center', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.1)' }}>
        <h2 style={{ color: '#fff', margin: '0 0 5px 0' }}>Gym<span style={{ color: '#10b981' }}>OS</span></h2>
        <p style={{ color: '#10b981', margin: '0 0 30px 0', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 'bold' }}>STAFF PORTAL</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="email" placeholder="Staff Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
          <button type="submit" style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Login</button>
        </form>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '20px' }}>Restricted access. Employees only.</p>
      </div>
    </div>
  );
};

export default StaffLogin;