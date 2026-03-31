import React, { useState, useEffect } from 'react';
import axios from 'axios';

// VVIP: Ye line cookies ko allow karti hai
axios.defaults.withCredentials = true; 

const SuperAdmin = () => {
  const [masterKey, setMasterKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [formData, setFormData] = useState({ gymName: '', gymCode: '', ownerName: '', contactPhone: '', email: '', password: '' });

  const API_URL = 'https://gym-management-system-ngbu.onrender.com/api/superadmin';

  // Page load pe check karo ki kya pehle se logged in hai (cookie hai?)
  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const res = await axios.get(`${API_URL}/gyms`);
      setGyms(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Login API call (Ye HttpOnly cookie set karegi)
      await axios.post(`${API_URL}/login`, { masterKey });
      fetchGyms(); // Login ke baad data fetch karo
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Master Key");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      setIsAuthenticated(false);
      setGyms([]);
      setMasterKey('');
    } catch (error) {
      console.error("Logout failed");
    }
  };

  const handleCreateGym = async (e) => {
    e.preventDefault();
    try {
      // Ab MasterKey bhejne ki zaroorat nahi, cookie apne aap jayegi
      await axios.post(`${API_URL}/gyms`, formData);
      alert("Gym and Admin account deployed successfully!");
      setFormData({ gymName: '', gymCode: '', ownerName: '', contactPhone: '', email: '', password: '' });
      fetchGyms();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create gym");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container auth-container">
        <div className="card">
          <h2 className="title" style={{color: 'var(--danger)'}}>Super Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Enter Master Key" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} required />
            <button type="submit" className="btn btn-danger" style={{width: '100%'}}>Unlock System</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Super <span>Admin</span> Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-warning">Lock System</button>
      </header>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Onboard New Gym & Admin</div>
          <form onSubmit={handleCreateGym}>
            <input placeholder="Gym Name" value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} required />
            <input placeholder="Unique Gym Code" value={formData.gymCode} onChange={e => setFormData({...formData, gymCode: e.target.value})} required />
            <input placeholder="Owner Name" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required />
            <input placeholder="Contact Phone" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} required />
            
            <div style={{marginTop: '15px', borderTop: '1px solid #444', paddingTop: '15px'}}>
              <p style={{fontSize: '0.8rem', color: '#888', marginBottom: '10px'}}>Admin Login Credentials:</p>
              <input type="email" placeholder="Admin Email (Login ID)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input type="password" placeholder="Set Admin Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px'}}>Deploy Full System</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">Active Tenants ({gyms.length})</div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Gym Name</th>
                  <th>Invite Code</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gyms.map(gym => (
                  <tr key={gym._id}>
                    <td>{gym.gymName}</td>
                    <td><span className="badge badge-primary">{gym.gymCode}</span></td>
                    <td>{gym.ownerName}</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;