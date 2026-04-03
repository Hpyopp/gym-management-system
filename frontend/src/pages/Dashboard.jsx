import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const MemberDashboard = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 BULLETPROOF ID EXTRACTOR 🔥
  const id = params.id || params.userId || location.pathname.split('/').pop();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPlan = async () => {
      if (!id || id === 'undefined' || id === 'dashboard') {
        setError('Invalid User ID in URL. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`https://gym-management-system-ngbu.onrender.com/api/plans/my-plan/${id}`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your protocol. Ask Admin to assign a plan.');
        setLoading(false);
      }
    };
    fetchMyPlan();
  }, [id]);

  const calculateDaysLeft = (expiry) => {
    if (!expiry) return 0;
    const diffTime = new Date(expiry) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading Premium Profile...</div>;
  
  if (error) return (
    <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>⚠️</h1>
      <h2 style={{ padding: '0 20px', textAlign: 'center' }}>{error}</h2>
      <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '12px 25px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Go Back</button>
    </div>
  );

  const isExpired = new Date(data.profile.expiryDate) < new Date();
  const daysLeft = calculateDaysLeft(data.profile.expiryDate);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: '"Inter", sans-serif', padding: '30px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* PREMIUM HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Gym<span style={{ color: '#3b82f6' }}>OS</span> Protocol
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem', fontWeight: '500' }}>
              Current Mass: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{data.userWeight} Kg</span>
            </p>
          </div>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>Log Out</button>
        </div>

        {/* PREMIUM STATUS & PERFECTLY ALIGNED QR CARD */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '35px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem', fontWeight: 'bold' }}>Membership Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '8px 24px', backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isExpired ? '#ef4444' : '#10b981', borderRadius: '8px', fontWeight: 'bold', border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, fontSize: '1rem', letterSpacing: '1px' }}>
                {isExpired ? 'EXPIRED' : 'ACTIVE'}
              </div>
              {!isExpired && <span style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '1.2rem' }}>{daysLeft} Days Left</span>}
            </div>
            <div style={{ display: 'inline-block', backgroundColor: '#0f172a', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Valid till: <strong style={{color: '#f8fafc', fontSize: '1rem'}}>{new Date(data.profile.expiryDate).toLocaleDateString('en-IN')}</strong></p>
            </div>
          </div>
          
          {/* THE FIXED, STRAIGHT, PREMIUM QR CODE */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
              <QRCodeCanvas value={id} size={140} level={"H"} />
            </div>
            <p style={{ color: '#0f172a', margin: 0, fontSize: '0.9rem', fontWeight: '800', letterSpacing: '1px' }}>SCAN AT ENTRY</p>
          </div>

        </div>

        {/* PREMIUM DIET & WORKOUT GRID */}
        {data.assignedPlan ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* DIET CARD */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderTop: '4px solid #3b82f6', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: '0 0 25px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥗</span> 
                Nutritional Protocol
              </h2>
              <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem', backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                {data.assignedPlan.dietPlan}
              </div>
            </div>

            {/* WORKOUT CARD */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderTop: '4px solid #fbbf24', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: '0 0 25px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                <span style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏋️‍♂️</span> 
                Physical Exertion
              </h2>
              <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem', backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                {data.assignedPlan.workoutPlan}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1e293b', borderRadius: '16px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', marginBottom: '15px' }}>No Protocol Assigned</h2>
            <p style={{ fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>Your profile has been created, but your Gym Owner hasn't assigned a routine for your weight bracket yet. Please contact the front desk.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;