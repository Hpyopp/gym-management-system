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
        const res = await axios.get(`https://gym-management-system-ngbu.onrender.com/api/plans/my-plan/${userId}`);
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="container"><h2 className="title">Extracting metrics...</h2></div>;
  
  if (!data || !data.assignedPlan) return (
    <div className="container">
      <h2 className="title" style={{color: 'var(--danger)'}}>Data retrieval failed.</h2>
      <button onClick={() => navigate('/')} className="btn btn-primary">Return to Login</button>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Subject Protocol: <span>{data.assignedPlan?.planName || 'Plan'}</span></h1>
        <button onClick={() => navigate('/')} className="btn btn-danger">Disconnect</button>
      </header>

      {data.notifications?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {data.notifications.map((notif, index) => (
            <div key={index} className={`alert ${notif.type === 'Holiday' ? 'alert-warning' : 'alert-info'}`}>
              <strong>{notif.type}:</strong> {notif.message}
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.9, fontStyle: 'italic' }}>
                Recorded: {notif.date ? new Date(notif.date).toDateString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Biological Profile</div>
          <div className="data-row">
            <span className="data-label">Age</span>
            <span>{data.profile?.age || 'N/A'} Yrs</span>
          </div>
          <div className="data-row">
            <span className="data-label">Gender</span>
            <span>{data.profile?.gender || 'N/A'}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Current Mass</span>
            <span className="badge badge-primary">{data.userWeight} kg</span>
          </div>
          <div className="data-row">
            <span className="data-label">Medical Anomalies</span>
            <span style={{ color: data.profile?.medicalHistory === 'None' ? 'var(--text-main)' : 'var(--danger)' }}>
              {data.profile?.medicalHistory || 'None'}
            </span>
          </div>
          <div className="data-row" style={{ borderBottom: 'none' }}>
            <span className="data-label">Protocol Expiration</span>
            <span className="badge badge-danger">
              {data.profile?.expiryDate ? new Date(data.profile.expiryDate).toDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Nutritional Directive</div>
          <div style={{ marginBottom: '2rem' }}>
            <div className="data-row">
              <span className="badge badge-primary">0800 HRS</span> 
              <span style={{ textAlign: 'right' }}>{data.assignedPlan?.morningDiet}</span>
            </div>
            <div className="data-row">
              <span className="badge badge-primary">1300 HRS</span> 
              <span style={{ textAlign: 'right' }}>{data.assignedPlan?.lunchDiet}</span>
            </div>
            <div className="data-row" style={{ borderBottom: 'none' }}>
              <span className="badge badge-primary">2000 HRS</span> 
              <span style={{ textAlign: 'right' }}>{data.assignedPlan?.dinnerDiet}</span>
            </div>
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