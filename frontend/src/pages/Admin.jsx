import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 🔥 NAYE LIBRARIES FOR QR
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Admin = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview'); 
  
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, expiredMembers: 0, currentPlan: 'Loading...', chartData: [] });
  const [membersList, setMembersList] = useState([]);
  
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', age: '', weight: '', planDuration: '1 Month' });

  // Store, POS & Ledger
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [posForm, setPosForm] = useState({ userId: 'GUEST', productId: '', quantity: 1, paymentMethod: 'CASH' });
  const [totalAmount, setTotalAmount] = useState(0);

  // Plans & Staff
  const [plans, setPlans] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ minWeight: '', maxWeight: '', dietPlan: '', workoutPlan: '' });
  const [staffList, setStaffList] = useState([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });

  // 🔥 QR & ATTENDANCE STATE
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMemberQR, setSelectedMemberQR] = useState(null);

  const BASE_URL = 'https://gym-management-system-ngbu.onrender.com/api';

  const isPremium = stats.currentPlan === 'Pro' || stats.currentPlan === 'Elite';
  const isElite = stats.currentPlan === 'Elite';

  useEffect(() => {
    fetchData();
  }, [activeView, stats.currentPlan]); 

  // Dynamically calculate POS Total
  useEffect(() => {
    if (posForm.productId) {
      const selectedProduct = products.find(p => p._id === posForm.productId);
      if (selectedProduct) setTotalAmount(selectedProduct.price * posForm.quantity);
    } else {
      setTotalAmount(0);
    }
  }, [posForm.productId, posForm.quantity, products]);

  // 🔥 QR SCANNER LOGIC (Runs when Attendance view is opened)
  useEffect(() => {
    if (activeView === 'attendance' && isElite) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      let isScanning = false; // Lock to prevent rapid multiple scans

      const onScanSuccess = async (decodedText) => {
        if (isScanning) return;
        isScanning = true;
        try {
          const token = localStorage.getItem('token');
          // Hit the backend scanner route we made in the previous step
          const res = await axios.post(`${BASE_URL}/attendance/scan`, { memberId: decodedText }, { headers: { Authorization: `Bearer ${token}` } });
          alert(res.data.message); // Success Message
          fetchData(); // Refresh history table
        } catch (error) {
          alert(error.response?.data?.message || "Invalid QR or Server Error");
        }
        // Wait 3 seconds before allowing the next scan
        setTimeout(() => { isScanning = false; }, 3000);
      };

      scanner.render(onScanSuccess, (err) => { /* Ignore background errors */ });

      // Cleanup when navigating away from the scanner tab
      return () => {
        try { scanner.clear(); } catch(e) { console.error("Scanner clear error", e); }
      };
    }
  }, [activeView, isElite]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (activeView === 'overview') {
        const res = await axios.get(`${BASE_URL}/admin/members`, config);
        setStats(res.data);
      } else if (activeView === 'members') {
        const res = await axios.get(`${BASE_URL}/admin/members/list`, config);
        setMembersList(res.data);
      } else if (activeView === 'store' && isPremium) {
        const resProd = await axios.get(`${BASE_URL}/admin/products`, config);
        const resMem = await axios.get(`${BASE_URL}/admin/members/list`, config);
        setProducts(resProd.data);
        setMembersList(resMem.data);
      } else if (activeView === 'ledger') {
        const res = await axios.get(`${BASE_URL}/admin/transactions`, config);
        setTransactions(res.data);
      } else if (activeView === 'plans' && isPremium) {
        const res = await axios.get(`${BASE_URL}/plans`, config);
        setPlans(res.data || []);
      } else if (activeView === 'staff' && isElite) {
        const res = await axios.get(`${BASE_URL}/staff/list`, config);
        setStaffList(res.data || []);
      } else if (activeView === 'attendance' && isElite) {
        // Fetch recent scans
        const res = await axios.get(`${BASE_URL}/attendance/history`, config);
        setAttendanceHistory(res.data || []);
      }
    } catch (error) { console.error("Fetch Error", error); }
  };

  const handleDeletePlan = async (planId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(); 
    } catch (error) { alert("Failed to delete the plan."); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/admin/members/add`, newMember, { headers: { Authorization: `Bearer ${token}` } });
      alert("Member Added Successfully!");
      setNewMember({ name: '', phone: '', age: '', weight: '', planDuration: '1 Month' });
      setShowMemberForm(false);
      fetchData();
    } catch (error) { alert(error.response?.data?.message || "Failed to add member."); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/staff/add`, newStaff, { headers: { Authorization: `Bearer ${token}` } });
      alert("Staff Account Created!");
      setNewStaff({ name: '', email: '', password: '' });
      setShowStaffForm(false);
      fetchData();
    } catch (error) { 
      if(error.response?.status === 404) alert("Backend Route Not Found!");
      else alert(error.response?.data?.message || "Failed to create staff account."); 
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/admin/products/add`, newProduct, { headers: { Authorization: `Bearer ${token}` } });
      alert("Product Added!");
      setNewProduct({ name: '', price: '', stock: '' });
      setShowProductForm(false);
      fetchData();
    } catch (error) { alert("Failed to add product"); }
  };

  const handlePOSCheckout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/admin/store/sell`, posForm, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Payment of ₹${totalAmount} Received via ${posForm.paymentMethod}!`);
      setPosForm({ userId: 'GUEST', productId: '', quantity: 1, paymentMethod: 'CASH' });
      fetchData();
    } catch (error) { alert(error.response?.data?.message || "Checkout Failed."); }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/plans/create`, newPlan, { headers: { Authorization: `Bearer ${token}` } });
      alert("Diet & Workout Plan Created!");
      setNewPlan({ minWeight: '', maxWeight: '', dietPlan: '', workoutPlan: '' });
      setShowPlanForm(false);
      fetchData();
    } catch (error) { alert("Failed to save plan."); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const sendWhatsAppReminder = (member) => {
    const isExpired = new Date(member.expiryDate) < new Date();
    const expiryDateStr = new Date(member.expiryDate).toLocaleDateString('en-IN');
    let message = isExpired 
      ? `Hi ${member.name}, \n\nYour gym membership expired on *${expiryDateStr}*. \n\nPlease renew your plan at the front desk! 🏋️‍♂️🔥`
      : `Hi ${member.name}, \n\nHope you are crushing your workouts! 💪 \n\nYour current membership is active until *${expiryDateStr}*.`;
    const encodedMessage = encodeURIComponent(message);
    let phone = member.phone.replace(/\D/g, ''); 
    if (phone.length === 10) phone = '91' + phone; 
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const styles = {
    layout: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: '"Inter", sans-serif', overflow: 'hidden' },
    sidebar: { width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0, zIndex: 10, overflowY: 'auto' },
    navItem: { padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', transition: '0.3s', fontWeight: '500' },
    navItemActive: { padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', backgroundColor: '#3b82f6', borderRight: '4px solid #60a5fa', fontWeight: 'bold' },
    mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', flex: 1 },
    posCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #3b82f6', marginBottom: '20px' },
    lockedContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px dashed #fbbf24', padding: '40px' }
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{ padding: '0 20px 30px 20px', borderBottom: '1px solid #334155' }}>
          <h2>Gym<span style={{ color: '#3b82f6' }}>OS</span></h2>
        </div>
        <div style={{ flex: 1, marginTop: '20px' }}>
          <div style={activeView === 'overview' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('overview')}>📊 Overview</div>
          <div style={activeView === 'members' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('members')}>👥 Member List</div>
          
          {/* 🔥 NEW: QR ATTENDANCE TAB */}
          <div style={activeView === 'attendance' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('attendance')}>
            📷 Scanner {isElite ? '' : '🔒'}
          </div>

          <div style={activeView === 'staff' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('staff')}>👨‍💼 Manage Staff {isElite ? '' : '🔒'}</div>
          <div style={activeView === 'plans' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('plans')}>🥗 Diet & Workout {isPremium ? '' : '🔒'}</div>
          <div style={activeView === 'store' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('store')}>🛒 Store / POS {isPremium ? '' : '🔒'}</div>
          <div style={activeView === 'ledger' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('ledger')}>📜 Passbook</div>
          
          <div style={{...styles.navItem, color: '#fbbf24', marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '20px'}} onClick={() => navigate('/pricing')}>🚀 Upgrade / Plans</div>
        </div>
        <div style={{ padding: '20px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* OVERVIEW */}
        {activeView === 'overview' && (
          <div>
            <h1 style={{ margin: '0 0 20px 0' }}>Command Center</h1>
            <div style={{ backgroundColor: stats.currentPlan === 'Elite' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: `1px solid ${stats.currentPlan === 'Elite' ? '#fbbf24' : '#3b82f6'}`, padding: '15px 20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: stats.currentPlan === 'Elite' ? '#fbbf24' : '#60a5fa' }}>Current Plan: {stats.currentPlan}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{stats.currentPlan === 'Elite' ? "Enterprise features unlocked." : "Upgrade to a premium plan."}</p>
              </div>
              {stats.currentPlan !== 'Elite' && (
                <button onClick={() => navigate('/pricing')} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Upgrade Plan</button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={styles.card}><h3 style={{color: '#94a3b8', margin: 0}}>Total Members</h3><h2 style={{fontSize: '2.5rem', margin: '10px 0 0 0'}}>{stats.totalMembers || 0}</h2></div>
              <div style={styles.card}><h3 style={{color: '#10b981', margin: 0}}>Active</h3><h2 style={{fontSize: '2.5rem', margin: '10px 0 0 0'}}>{stats.activeMembers || 0}</h2></div>
              <div style={styles.card}><h3 style={{color: '#ef4444', margin: 0}}>Expired</h3><h2 style={{fontSize: '2.5rem', margin: '10px 0 0 0'}}>{stats.expiredMembers || 0}</h2></div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
              <div style={{ ...styles.card, flex: 2, minWidth: '400px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 20px 0' }}>Member Joins (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="joins" name="New Members" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...styles.card, flex: 1, minWidth: '250px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 20px 0' }}>Current Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Active', count: stats.activeMembers || 0, fill: '#10b981' },
                    { name: 'Expired', count: stats.expiredMembers || 0, fill: '#ef4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 👥 MEMBER LIST WITH QR GENERATOR */}
        {activeView === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ margin: 0 }}>Member Database</h1>
              <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowMemberForm(true)}>➕ Add Member</button>
            </div>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Phone</th>
                    <th style={{ padding: '15px' }}>Expiry Date</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {membersList.map(m => {
                    const isExpired = new Date(m.expiryDate) < new Date();
                    return (
                      <tr key={m._id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '15px', color: '#fff', fontWeight: 'bold' }}>{m.name}</td>
                        <td style={{ padding: '15px', color: '#cbd5e1' }}>{m.phone}</td>
                        <td style={{ padding: '15px', color: '#94a3b8' }}>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td style={{ padding: '15px', color: isExpired ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{isExpired ? 'Expired' : 'Active'}</td>
                        <td style={{ padding: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button onClick={() => sendWhatsAppReminder(m)} style={{ padding: '8px 12px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>💬 Alert</button>
                          
                          {/* 🔥 THE QR VIEW BUTTON */}
                          <button onClick={() => { setSelectedMemberQR(m); setShowQRModal(true); }} style={{ padding: '8px 12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>🔳 View QR</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MEMBER QR MODAL */}
            {showQRModal && selectedMemberQR && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', width: '300px' }}>
                  <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>{selectedMemberQR.name}</h2>
                  <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Gym ID Code</p>
                  
                  <div style={{ padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'inline-block' }}>
                    <QRCodeCanvas value={selectedMemberQR._id} size={200} />
                  </div>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '20px' }}>Scan this code at the front desk for attendance.</p>
                  <button onClick={() => setShowQRModal(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                </div>
              </div>
            )}

            {/* ADD MEMBER MODAL */}
            {showMemberForm && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '400px' }}>
                  <h2 style={{ marginTop: 0, color: '#fff', marginBottom: '20px' }}>New Admission</h2>
                  <form onSubmit={handleAddMember}>
                    <input type="text" placeholder="Full Name" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} required />
                    <input type="text" placeholder="Phone Number" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} required />
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <input type="number" placeholder="Age" style={{flex: 1, padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155'}} value={newMember.age} onChange={e => setNewMember({...newMember, age: e.target.value})} required />
                      <input type="number" placeholder="Weight (Kg)" style={{flex: 1, padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155'}} value={newMember.weight} onChange={e => setNewMember({...newMember, weight: e.target.value})} required />
                    </div>
                    <select style={{width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newMember.planDuration} onChange={e => setNewMember({...newMember, planDuration: e.target.value})} required>
                      <option value="1 Month">1 Month Plan</option>
                      <option value="3 Months">3 Months Plan</option>
                      <option value="6 Months">6 Months Plan</option>
                      <option value="12 Months">1 Year Plan</option>
                    </select>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setShowMemberForm(false)} style={{ flex: 1, padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Register Member</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📷 QR ATTENDANCE SCANNER TAB (ELITE ONLY) */}
        {activeView === 'attendance' && (
          <div>
            {!isElite ? (
              <div style={styles.lockedContainer}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🔒</h1>
                <h2 style={{ color: '#fbbf24', margin: '0 0 10px 0' }}>Elite Feature Locked</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '30px' }}>QR Code Attendance System is an exclusive feature for Elite plans to automate entries.</p>
                <button onClick={() => navigate('/pricing')} style={{ padding: '15px 30px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Upgrade to Elite</button>
              </div>
            ) : (
              <div>
                <h1 style={{ margin: '0 0 10px 0' }}>Front Desk Scanner</h1>
                <p style={{ color: '#94a3b8', margin: '0 0 30px 0' }}>Scan member QR codes here. The system will automatically verify their plan expiry.</p>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  {/* Left Side: Camera Scanner */}
                  <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <div id="qr-reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
                  </div>

                  {/* Right Side: Recent Scans History */}
                  <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>Recent Entries Today</h3>
                    {attendanceHistory.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>No entries scanned yet.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                        {attendanceHistory.map((record, index) => (
                          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 10px', borderBottom: '1px solid #334155' }}>
                            <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{record.memberId?.name || 'Unknown'}</span>
                            <span style={{ color: '#10b981', fontSize: '0.9rem' }}>{new Date(record.createdAt).toLocaleTimeString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 👨‍💼 MANAGE STAFF (ONLY ELITE) */}
        {activeView === 'staff' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ margin: 0 }}>Staff & Team Management</h1>
                <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Create accounts for your Receptionists and Trainers.</p>
              </div>
              {isElite && <button style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowStaffForm(true)}>➕ Add Staff</button>}
            </div>

            {!isElite ? (
              <div style={styles.lockedContainer}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🔒</h1>
                <h2 style={{ color: '#fbbf24', margin: '0 0 10px 0' }}>Elite Feature Locked</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '30px' }}>Staff & Role-Based Access Control is an exclusive feature for Elite plans.</p>
                <button onClick={() => navigate('/pricing')} style={{ padding: '15px 30px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Upgrade to Elite</button>
              </div>
            ) : (
              <div>
                <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '15px' }}>Staff Name</th>
                        <th style={{ padding: '15px' }}>Login Email</th>
                        <th style={{ padding: '15px' }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map(s => (
                        <tr key={s._id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '15px', color: '#fff', fontWeight: 'bold' }}>{s.name}</td>
                          <td style={{ padding: '15px', color: '#cbd5e1' }}>{s.email}</td>
                          <td style={{ padding: '15px' }}><span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>RECEPTIONIST</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showStaffForm && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '400px' }}>
                      <h2 style={{ marginTop: 0, color: '#fff', marginBottom: '20px' }}>Create Staff Account</h2>
                      <form onSubmit={handleAddStaff}>
                        <input type="text" placeholder="Staff Name" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                        <input type="email" placeholder="Login Email" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                        <input type="text" placeholder="Set Password" style={{width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="button" onClick={() => setShowStaffForm(false)} style={{ flex: 1, padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                          <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🥗 THE NEW DIET & WORKOUT PLANS UI (CARDS) */}
        {activeView === 'plans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ margin: 0 }}>Automated Diet & Workout Engine</h1>
                <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Manage assigned routines based on member weight ranges.</p>
              </div>
              {isPremium && <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowPlanForm(true)}>➕ Create New Plan</button>}
            </div>

            {!isPremium ? (
              <div style={styles.lockedContainer}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🔒</h1>
                <h2 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Feature Locked</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '30px' }}>The Automated Diet & Workout Engine is only available on Pro and Elite plans.</p>
                <button onClick={() => navigate('/pricing')} style={{ padding: '15px 30px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Upgrade to Pro</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                  {plans.map(p => (
                    <div key={p._id} style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '25px', border: '1px solid #334155', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <button onClick={() => handleDeletePlan(p._id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', transition: '0.2s' }}>🗑️ Delete</button>
                      <h2 style={{ color: '#10b981', margin: '0 0 20px 0', borderBottom: '1px dashed #334155', paddingBottom: '15px', fontSize: '1.5rem' }}>⚖️ {p.minWeight} - {p.maxWeight} Kg</h2>
                      <h4 style={{ color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>🥗 Diet Plan</h4>
                      <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #60a5fa' }}>{p.dietPlan}</p>
                      <h4 style={{ color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>🏋️‍♂️ Workout Routine</h4>
                      <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #fbbf24' }}>{p.workoutPlan}</p>
                    </div>
                  ))}
                  {plans.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>No plans created yet. Click "Create New Plan" to add your first routine.</div>}
                </div>

                {showPlanForm && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', width: '500px', border: '1px solid #334155' }}>
                      <h2 style={{ marginTop: 0, color: '#fff', marginBottom: '25px' }}>Create Master Plan</h2>
                      <form onSubmit={handleSavePlan}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                          <div style={{ flex: 1 }}><label style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Min Weight (Kg)</label><input type="number" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newPlan.minWeight} onChange={e => setNewPlan({...newPlan, minWeight: e.target.value})} required /></div>
                          <div style={{ flex: 1 }}><label style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Max Weight (Kg)</label><input type="number" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newPlan.maxWeight} onChange={e => setNewPlan({...newPlan, maxWeight: e.target.value})} required /></div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>🥗 Diet Plan Details</label>
                          <textarea rows="4" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box', resize: 'vertical'}} value={newPlan.dietPlan} onChange={e => setNewPlan({...newPlan, dietPlan: e.target.value})} required />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>🏋️‍♂️ Workout Routine Details</label>
                          <textarea rows="4" style={{width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box', resize: 'vertical'}} value={newPlan.workoutPlan} onChange={e => setNewPlan({...newPlan, workoutPlan: e.target.value})} required />
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <button type="button" onClick={() => setShowPlanForm(false)} style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                          <button type="submit" style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Plan</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🛒 STORE / POS */}
        {activeView === 'store' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
              <h1 style={{ margin: 0 }}>Point of Sale (POS)</h1>
              {isPremium && <button style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowProductForm(true)}>➕ Add Inventory</button>}
            </div>

            {!isPremium ? (
              <div style={styles.lockedContainer}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🔒</h1>
                <h2 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Feature Locked</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '30px' }}>The POS & Inventory Checkout System is only available on Pro and Elite plans. Upgrade to unlock this feature.</p>
                <button onClick={() => navigate('/pricing')} style={{ padding: '15px 30px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Upgrade to Pro</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ ...styles.posCard, flex: 2 }}>
                    <h2 style={{marginTop: 0, color: '#60a5fa'}}>New Sale</h2>
                    <form onSubmit={handlePOSCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{color: '#94a3b8', display: 'block', marginBottom: '8px'}}>Customer</label>
                          <select style={{width: '100%', padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155'}} value={posForm.userId} onChange={e => setPosForm({...posForm, userId: e.target.value})} required>
                            <option value="GUEST">🚶‍♂️ Walk-in Customer (Guest)</option>
                            {membersList.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{color: '#94a3b8', display: 'block', marginBottom: '8px'}}>Select Product</label>
                          <select style={{width: '100%', padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155'}} value={posForm.productId} onChange={e => setPosForm({...posForm, productId: e.target.value})} required>
                            <option value="">-- Choose Item --</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price} (Stock: {p.stock})</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{color: '#94a3b8', display: 'block', marginBottom: '8px'}}>Quantity</label>
                          <input type="number" min="1" style={{width: '100%', padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155'}} value={posForm.quantity} onChange={e => setPosForm({...posForm, quantity: e.target.value})} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{color: '#94a3b8', display: 'block', marginBottom: '8px'}}>Payment Mode</label>
                          <select style={{width: '100%', padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #3b82f6', fontWeight: 'bold'}} value={posForm.paymentMethod} onChange={e => setPosForm({...posForm, paymentMethod: e.target.value})} required>
                            <option value="CASH">💵 Cash</option>
                            <option value="UPI">📱 UPI / QR Code</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginTop: '20px', borderTop: '1px dashed #334155', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, color: '#94a3b8' }}>Total Amount</h4>
                          <h1 style={{ margin: 0, color: '#10b981', fontSize: '2.5rem' }}>₹{totalAmount}</h1>
                        </div>
                        <button type="submit" disabled={totalAmount === 0} style={{ padding: '15px 40px', background: totalAmount === 0 ? '#334155' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: totalAmount === 0 ? 'not-allowed' : 'pointer' }}>Mark as Paid</button>
                      </div>
                    </form>
                  </div>
                </div>

                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#fff' }}>Current Inventory</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '15px' }}>Product</th>
                        <th style={{ padding: '15px' }}>Price</th>
                        <th style={{ padding: '15px' }}>Stock Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '15px', color: '#fff' }}>{p.name}</td>
                          <td style={{ padding: '15px', color: '#10b981' }}>₹{p.price}</td>
                          <td style={{ padding: '15px', color: p.stock < 5 ? '#ef4444' : '#fff', fontWeight: 'bold' }}>{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showProductForm && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '400px' }}>
                      <h2 style={{ marginTop: 0, color: '#fff' }}>Add New Product</h2>
                      <form onSubmit={handleAddProduct}>
                        <input type="text" placeholder="Product Name" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                        <input type="number" placeholder="Price (₹)" style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                        <input type="number" placeholder="Stock Quantity" style={{width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box'}} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="button" onClick={() => setShowProductForm(false)} style={{ flex: 1, padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                          <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 📜 LEDGER / PASSBOOK */}
        {activeView === 'ledger' && (
          <div>
            <h1 style={{ margin: '0 0 30px 0' }}>Daily Cash/UPI Ledger</h1>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>Customer</th>
                    <th style={{ padding: '15px' }}>Item Sold</th>
                    <th style={{ padding: '15px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '15px', color: '#94a3b8' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '15px', color: '#fff' }}>{t.userId === 'GUEST' ? '🚶‍♂️ Walk-in' : (t.userId?.name || 'Unknown')}</td>
                      <td style={{ padding: '15px', color: '#cbd5e1' }}>{t.description}</td>
                      <td style={{ padding: '15px', color: '#10b981', fontWeight: 'bold' }}>+ ₹{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;