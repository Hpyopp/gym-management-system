import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SuperAdmin = () => {
  const [data, setData] = useState({ stats: {}, chartData: [], gyms: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // 🔥 NEW STATE: Added email and password for the Admin account 🔥
  const [newGym, setNewGym] = useState({ 
    name: '', gymCode: '', ownerName: '', phone: '', plan: 'Starter', email: '', password: '' 
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showInsights, setShowInsights] = useState(false);
  const [selectedInsights, setSelectedInsights] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = 'https://gym-management-system-ngbu.onrender.com/api/superadmin';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/gyms`);
      setData(res.data);
    } catch (error) { console.error("Fetch Error:", error); }
  };

  const handleAddGym = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/gyms/add`, newGym);
      alert(`✅ Tenant Provisioned Successfully!\n\nCredentials for Owner:\nEmail: ${newGym.email}\nPassword: ${newGym.password}`);
      setNewGym({ name: '', gymCode: '', ownerName: '', phone: '', plan: 'Starter', email: '', password: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error) { 
      alert(error.response?.data?.message || "Failed to provision gym"); 
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? "SUSPEND ⛔" : "RESTORE ✅";
    if (!window.confirm(`Are you sure you want to ${action} this tenant's access?`)) return;
    try {
      await axios.put(`${BASE_URL}/gyms/toggle/${id}`);
      fetchData();
    } catch (error) { alert("Failed to toggle status"); }
  };

  const handleViewInsights = async (id) => {
    setShowInsights(true);
    setInsightLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/gyms/${id}/insights`);
      setSelectedInsights(res.data);
    } catch (error) {
      alert("Failed to load insights for this gym.");
      setShowInsights(false);
    } finally {
      setInsightLoading(false);
    }
  };

  const handlePlanChange = async (gymId, newPlan) => {
    if(!window.confirm(`Change subscription to ${newPlan}? MRR will be updated immediately.`)) return;
    try {
      await axios.put(`${BASE_URL}/gyms/${gymId}/plan`, { plan: newPlan });
      fetchData(); 
    } catch (error) {
      alert("Failed to update gym plan");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const filteredGyms = (data.gyms || []).filter(g => {
    const gymName = g.name || '';
    const gymCode = g.gymCode || '';
    return gymName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           gymCode.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#09090b', color: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#020617', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '25px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 25px 30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Gym<span style={{ color: '#fbbf24' }}>OS</span></h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>HQ Control Network</span>
          </div>
        </div>
        <div style={{ flex: 1, marginTop: '20px' }}>
          <div style={{ padding: '15px 25px', backgroundColor: 'rgba(251, 191, 36, 0.05)', color: '#fbbf24', borderRight: '3px solid #fbbf24', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
            📊 Global Metrics
          </div>
        </div>
        <div style={{ padding: '25px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>Disconnect Securely</button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Executive Dashboard</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Monitor REAL MRR, tenant health, and deep usage insights.</p>
          </div>
          <button onClick={() => setShowAddForm(true)} style={{ padding: '14px 28px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.5px', boxShadow: '0 10px 25px rgba(251, 191, 36, 0.2)' }}>
            + Provision New Tenant
          </button>
        </div>

        {/* METRICS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Recurring Revenue</h3>
            <h2 style={{ fontSize: '2.8rem', margin: 0, color: '#fbbf24', fontWeight: '900' }}>₹{((data.stats && data.stats.totalMRR) || 0).toLocaleString()}</h2>
          </div>
          <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Tenants</h3>
            <h2 style={{ fontSize: '2.8rem', margin: 0, color: '#10b981', fontWeight: '900' }}>{(data.stats && data.stats.activeGyms) || 0}</h2>
          </div>
          <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Suspended / Churned</h3>
            <h2 style={{ fontSize: '2.8rem', margin: 0, color: '#ef4444', fontWeight: '900' }}>{(data.stats && data.stats.suspendedGyms) || 0}</h2>
          </div>
        </div>

        {/* TENANT DIRECTORY TABLE */}
        <div style={{ backgroundColor: '#020617', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600' }}>Tenant Directory</h2>
            <input type="text" placeholder="🔍 Search Gyms or Codes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#09090b', color: '#fff', width: '300px', outline: 'none' }}/>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <th style={{ padding: '15px 20px' }}>Tenant Name</th>
                  <th style={{ padding: '15px 20px' }}>Subscription Plan</th>
                  <th style={{ padding: '15px 20px' }}>Tenant ID (Code)</th>
                  <th style={{ padding: '15px 20px' }}>Status</th>
                  <th style={{ padding: '15px 20px', textAlign: 'right' }}>Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredGyms.map(gym => (
                  <tr key={gym._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    
                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      <div style={{ color: gym.name ? '#f8fafc' : '#ef4444', fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>
                        {gym.name || '⚠️ Unnamed Gym'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'normal' }}>
                        {gym.ownerName || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      <select 
                        value={gym.plan || 'Starter'} 
                        onChange={(e) => handlePlanChange(gym._id, e.target.value)}
                        style={{ backgroundColor: '#09090b', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer', marginBottom: '6px' }}
                      >
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                        <option value="Elite">Elite</option>
                      </select>
                      <br/>
                      <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                        +₹{gym.planPrice}/mo
                      </span>
                    </td>

                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', fontFamily: 'monospace', color: '#fbbf24', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        {gym.gymCode || 'NO_CODE'}
                      </span>
                    </td>

                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gym.isActive ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${gym.isActive ? '#10b981' : '#ef4444'}` }}></div>
                        <span style={{ color: gym.isActive ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                          {gym.isActive ? 'ONLINE' : 'SUSPENDED'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button onClick={() => handleViewInsights(gym._id)} style={{ padding: '8px 14px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: '0.2s' }}>
                          👁️ Insights
                        </button>
                        <button onClick={() => handleToggleStatus(gym._id, gym.isActive)} style={{ padding: '8px 14px', backgroundColor: gym.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: gym.isActive ? '#ef4444' : '#10b981', border: `1px solid ${gym.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: '0.2s' }}>
                          {gym.isActive ? 'Kill Access' : 'Restore'}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SPY MODE MODAL */}
        {showInsights && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div style={{ backgroundColor: '#020617', padding: '40px', borderRadius: '24px', width: '450px', border: '1px solid rgba(251, 191, 36, 0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(251, 191, 36, 0.05)', position: 'relative' }}>
              <button onClick={() => setShowInsights(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }}>×</button>
              {insightLoading ? (
                <div style={{ textAlign: 'center', color: '#fbbf24', fontWeight: 'bold', padding: '40px 0', letterSpacing: '1px' }}>Decrypting Network Data...</div>
              ) : selectedInsights ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(251, 191, 36, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>🏢</div>
                    <div>
                      <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem', fontWeight: '800' }}>{selectedInsights.gymName}</h2>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Deep Usage Analytics</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ backgroundColor: '#09090b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>👥 Total Active Members</span><strong style={{ color: '#f8fafc', fontSize: '1.4rem' }}>{selectedInsights.insights.totalMembers}</strong>
                    </div>
                    <div style={{ backgroundColor: '#09090b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>👔 Staff Accounts</span><strong style={{ color: '#f8fafc', fontSize: '1.4rem' }}>{selectedInsights.insights.totalStaff}</strong>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', padding: '25px 20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem' }}>📈 Gym's Gross Revenue</span><strong style={{ color: '#10b981', fontSize: '1.6rem', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>₹{selectedInsights.insights.gymRevenue.toLocaleString()}</strong>
                    </div>
                  </div>
                  <button onClick={() => setShowInsights(false)} style={{ width: '100%', marginTop: '30px', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.2s', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)' }}>Acknowledge</button>
                </>
              ) : (
                <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px 0' }}>Data extraction failed.</div>
              )}
            </div>
          </div>
        )}

        {/* PROVISIONING MODAL WITH ADMIN LOGIN FIELDS */}
        {showAddForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <div style={{ backgroundColor: '#020617', padding: '40px', borderRadius: '24px', width: '480px', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ marginTop: 0, color: '#f8fafc', marginBottom: '25px', fontSize: '1.4rem' }}>Provision New Tenant</h2>
              <form onSubmit={handleAddGym} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Section 1: Business Details */}
                <div style={{ padding: '15px', backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 0, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏢 Business Info</h3>
                  <div style={{ marginBottom: '15px' }}><label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Gym Entity Name</label><input type="text" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'}} value={newGym.name} onChange={e => setNewGym({...newGym, name: e.target.value})} required /></div>
                  <div style={{ marginBottom: '15px' }}><label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Tenant ID (Used internally)</label><input type="text" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fbbf24', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', textTransform: 'uppercase'}} value={newGym.gymCode} onChange={e => setNewGym({...newGym, gymCode: e.target.value})} required /></div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Subscription Plan</label>
                    <select style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#60a5fa', border: '1px solid #3b82f6', fontWeight: 'bold', outline: 'none'}} value={newGym.plan} onChange={e => setNewGym({...newGym, plan: e.target.value})} required>
                      <option value="Starter">Starter (₹499/mo)</option><option value="Pro">Pro (₹999/mo)</option><option value="Elite">Elite (₹1499/mo)</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Owner & Admin Access Details */}
                <div style={{ padding: '15px', backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <h3 style={{ color: '#60a5fa', fontSize: '0.85rem', marginTop: 0, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>🔑 Owner / Admin Access</h3>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}><label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Owner Name</label><input type="text" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'}} value={newGym.ownerName} onChange={e => setNewGym({...newGym, ownerName: e.target.value})} required /></div>
                    <div style={{ flex: 1 }}><label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Contact Phone</label><input type="text" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'}} value={newGym.phone} onChange={e => setNewGym({...newGym, phone: e.target.value})} required /></div>
                  </div>

                  {/* 🔥 THE MISSING LOGIN CREDENTIALS 🔥 */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Admin Login Email</label>
                    <input type="email" placeholder="admin@gym.com" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', outline: 'none'}} value={newGym.email} onChange={e => setNewGym({...newGym, email: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Admin Login Password</label>
                    <input type="text" placeholder="Set a strong password" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#020617', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', outline: 'none'}} value={newGym.password} onChange={e => setNewGym({...newGym, password: e.target.value})} required />
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '14px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '14px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Deploy Tenant & Create Admin</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdmin;