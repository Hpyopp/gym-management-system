import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true 
        };

        // PROD FIX: Changed back to LIVE Render API
        const res = await axios.get(`https://gym-management-system-ngbu.onrender.com/api/plans/my-plan/${userId}`, config);
        
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/');
        }
      }
    };
    if (userId) fetchData();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  if (loading) return <div className="container"><h2 className="title">Extracting metrics...</h2></div>;
  
  if (!data || !data.assignedPlan) return (
    <div className="container">
      <h2 className="title" style={{color: 'var(--danger)'}}>Data retrieval failed.</h2>
      <button onClick={handleLogout} className="btn btn-primary">Return to Login</button>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <div className="branding-box">
            <img src="/logo.jpeg" alt="Gym Logo" className="gym-logo" style={{ borderRadius: '8px' }} />
            <h1 className="title">Subject Protocol: <span>{data.assignedPlan?.planName || 'Plan'}</span></h1>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">Disconnect</button>
      </header>

      {/* Baaki ka pura UI waisa hi rahega jaisa pehle tha, UI mein koi error nahi tha */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">Biological Profile</div>
          <div className="data-row"><span className="data-label">Age</span><span>{data.profile?.age || 'N/A'} Yrs</span></div>
          <div className="data-row"><span className="data-label">Gender</span><span>{data.profile?.gender || 'N/A'}</span></div>
          <div className="data-row"><span className="data-label">Current Mass</span><span className="badge badge-primary">{data.userWeight} kg</span></div>
        </div>

        <div className="card">
          <div className="card-header">Nutritional Directive</div>
          <div style={{ marginBottom: '2rem' }}>
            <div className="data-row"><span className="badge badge-primary">0800 HRS</span> <span style={{ textAlign: 'right' }}>{data.assignedPlan?.morningDiet}</span></div>
            <div className="data-row"><span className="badge badge-primary">1300 HRS</span> <span style={{ textAlign: 'right' }}>{data.assignedPlan?.lunchDiet}</span></div>
            <div className="data-row" style={{ borderBottom: 'none' }}><span className="badge badge-primary">2000 HRS</span> <span style={{ textAlign: 'right' }}>{data.assignedPlan?.dinnerDiet}</span></div>
          </div>

          <div className="card-header">Physical Exertion Protocol</div>
          <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px', color: 'var(--text-muted)' }}>
            {data.assignedPlan?.workoutRoutine}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;