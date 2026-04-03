import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔥 EXACT PAYLOAD BACKEND WANTS 🔥
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: identifier, 
        password: password
      });

      // Saving Credentials in LocalStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('gymCode', res.data.user.gymCode);
      localStorage.setItem('ownerName', res.data.user.name);

      alert("✅ Login Successful! Welcome to Command Center.");

      // Role-based Redirect
      if (res.data.user.role === 'admin') {
        navigate('/admin'); // Admin goes to Dashboard
      } else {
        navigate('/member'); // Member goes to their app
      }

    } catch (error) {
      // 🔥 THE LIFESAVER: Puts the exact backend error on screen 🔥
      const errorMsg = error.response?.data?.message || "Server Unreachable. Is Render awake?";
      alert(`❌ ERROR: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '25px', fontSize: '1.8rem' }}>Gym System Login</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Phone Number / Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone"
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' }}
              required
            />
          </div>
          
          <div>
            <label style={{ color: '#e2e8f0', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', fontSize: '1rem', transition: '0.2s' }}
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div style={{ marginTop: '25px', fontSize: '0.9rem', color: '#cbd5e1' }}>
          New Member? <Link to="/register" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 'bold' }}>Register Here</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;