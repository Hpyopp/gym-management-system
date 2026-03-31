import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // PROD FIX: Changed back to LIVE Render API
      const res = await axios.post('https://gym-management-system-ngbu.onrender.com/api/auth/login', form);
      
      localStorage.setItem('token', res.data.token || 'temp-token');
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));

      // THE BUG FIX: Accessing correct user ID so it doesn't say 'undefined'
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/dashboard/${res.data.user.id}`); 
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="container auth-container">
      <div className="card">
        <h2 className="title">Gym System Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Phone Number / Email</label>
            <input 
              type="text" 
              placeholder="Enter your phone/email" 
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{marginTop: '10px'}}>
            Authenticate
          </button>
        </form>
        <div className="link-text">
          New Member? <Link to="/register">Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;