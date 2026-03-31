import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    activeProtocols: 0,
    terminated: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // PROD FIX: Live Render API URL
        const res = await axios.get('https://gym-management-system-ngbu.onrender.com/api/admin/members', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    };
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#0a0f1c', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '50px', borderRadius: '8px' }} />
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Command <span style={{ color: '#3b82f6' }}>Center</span></h1>
        </div>
      </header>

      <button
        onClick={handleLogout}
        style={{ width: '100%', padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' }}
      >
        Disconnect
      </button>

      {/* DASHBOARD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '30px 20px', borderRadius: '8px', textAlign: 'center', borderBottom: '4px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#9ca3af' }}>Total Subjects</h3>
          <h1 style={{ margin: 0, fontSize: '3.5rem' }}>{stats.totalSubjects}</h1>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '30px 20px', borderRadius: '8px', textAlign: 'center', borderBottom: '4px solid #10b981' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#9ca3af' }}>Active Protocols</h3>
          <h1 style={{ margin: 0, fontSize: '3.5rem', color: '#10b981' }}>{stats.activeProtocols}</h1>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '30px 20px', borderRadius: '8px', textAlign: 'center', borderBottom: '4px solid #ef4444' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#9ca3af' }}>Terminated / Expired</h3>
          <h1 style={{ margin: 0, fontSize: '3.5rem', color: '#ef4444' }}>{stats.terminated}</h1>
        </div>
      </div>

      {/* STATUS MATRIX (CHART) */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#9ca3af', letterSpacing: '1px' }}>STATUS MATRIX</h3>
        
        {/* THE FIX: Is Div ko fixed height di hai taaki chart sikud ke error na de */}
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: 'white' }} />
              <Line type="monotone" dataKey="subjects" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="protocols" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admin;