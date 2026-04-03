import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('scanner'); // Staff login karte hi seedha scanner pe jayega
  
  const [membersList, setMembersList] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', age: '', weight: '', planDuration: '1 Month' });

  const [products, setProducts] = useState([]);
  const [posForm, setPosForm] = useState({ userId: 'GUEST', productId: '', quantity: 1, paymentMethod: 'CASH' });
  const [totalAmount, setTotalAmount] = useState(0);

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMemberQR, setSelectedMemberQR] = useState(null);

  const BASE_URL = 'https://gym-management-system-ngbu.onrender.com/api';

  useEffect(() => { fetchData(); }, [activeView]);

  useEffect(() => {
    if (posForm.productId) {
      const selectedProduct = products.find(p => p._id === posForm.productId);
      if (selectedProduct) setTotalAmount(selectedProduct.price * posForm.quantity);
    } else { setTotalAmount(0); }
  }, [posForm.productId, posForm.quantity, products]);

  // 🔥 QR SCANNER LOGIC FOR RECEPTIONIST
  useEffect(() => {
    if (activeView === 'scanner') {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      let isScanning = false; 

      const onScanSuccess = async (decodedText) => {
        if (isScanning) return;
        isScanning = true;
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${BASE_URL}/attendance/scan`, { memberId: decodedText }, { headers: { Authorization: `Bearer ${token}` } });
          alert(res.data.message); 
          fetchData(); 
        } catch (error) {
          alert(error.response?.data?.message || "Invalid QR or Server Error");
        }
        setTimeout(() => { isScanning = false; }, 3000);
      };

      scanner.render(onScanSuccess, (err) => {});
      return () => { try { scanner.clear(); } catch(e) {} };
    }
  }, [activeView]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (activeView === 'members') {
        const res = await axios.get(`${BASE_URL}/admin/members/list`, config);
        setMembersList(res.data);
      } else if (activeView === 'store') {
        const resProd = await axios.get(`${BASE_URL}/admin/products`, config);
        const resMem = await axios.get(`${BASE_URL}/admin/members/list`, config);
        setProducts(resProd.data);
        setMembersList(resMem.data);
      } else if (activeView === 'scanner') {
        const res = await axios.get(`${BASE_URL}/attendance/history`, config);
        setAttendanceHistory(res.data || []);
      }
    } catch (error) { console.error("Fetch Error", error); }
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

  const handlePOSCheckout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/admin/store/sell`, posForm, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Payment of ₹${totalAmount} Received! Hand over the cash to the owner at day end.`);
      setPosForm({ userId: 'GUEST', productId: '', quantity: 1, paymentMethod: 'CASH' });
      fetchData();
    } catch (error) { alert("Checkout Failed."); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/'); // Wapas home pe
  };

  const sendWhatsAppReminder = (member) => {
    const isExpired = new Date(member.expiryDate) < new Date();
    const expiryDateStr = new Date(member.expiryDate).toLocaleDateString('en-IN');
    let message = isExpired 
      ? `Hi ${member.name}, \n\nYour gym membership expired on *${expiryDateStr}*. \n\nPlease renew your plan at the front desk! 🏋️‍♂️🔥`
      : `Hi ${member.name}, \n\nYour current membership is active until *${expiryDateStr}*. Keep crushing it! 💪`;
    const encodedMessage = encodeURIComponent(message);
    let phone = member.phone.replace(/\D/g, ''); 
    if (phone.length === 10) phone = '91' + phone; 
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const styles = {
    layout: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: '"Inter", sans-serif', overflow: 'hidden' },
    sidebar: { width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 },
    navItem: { padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', transition: '0.3s', fontWeight: '500' },
    navItemActive: { padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', backgroundColor: '#10b981', borderRight: '4px solid #059669', fontWeight: 'bold' },
    mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
    posCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #10b981', marginBottom: '20px' },
  };

  return (
    <div style={styles.layout}>
      {/* RESTRICTED SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{ padding: '0 20px 30px 20px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0 }}>Gym<span style={{ color: '#10b981' }}>OS</span></h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '12px', marginTop: '5px', display: 'inline-block' }}>STAFF PORTAL</span>
        </div>
        <div style={{ flex: 1, marginTop: '20px' }}>
          <div style={activeView === 'scanner' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('scanner')}>📷 Front Desk Scanner</div>
          <div style={activeView === 'members' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('members')}>👥 Member Database</div>
          <div style={activeView === 'store' ? styles.navItemActive : styles.navItem} onClick={() => setActiveView('store')}>🛒 Point of Sale (POS)</div>
        </div>
        <div style={{ padding: '20px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* 📷 QR ATTENDANCE SCANNER */}
        {activeView === 'scanner' && (
          <div>
            <h1 style={{ margin: '0 0 10px 0' }}>Front Desk Scanner</h1>
            <p style={{ color: '#94a3b8', margin: '0 0 30px 0' }}>Scan member QR codes for daily entry.</p>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                <div id="qr-reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
              </div>
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

        {/* 👥 MEMBER LIST */}
        {activeView === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ margin: 0 }}>Member Database</h1>
              <button style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowMemberForm(true)}>➕ Add Member</button>
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
                          <button onClick={() => { setSelectedMemberQR(m); setShowQRModal(true); }} style={{ padding: '8px 12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>🔳 View QR</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* QR MODAL */}
            {showQRModal && selectedMemberQR && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', width: '300px' }}>
                  <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>{selectedMemberQR.name}</h2>
                  <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Gym ID Code</p>
                  <div style={{ padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'inline-block' }}><QRCodeCanvas value={selectedMemberQR._id} size={200} /></div>
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
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Register Member</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🛒 STORE / POS */}
        {activeView === 'store' && (
          <div>
            <h1 style={{ margin: '0 0 30px 0' }}>Point of Sale (POS)</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ ...styles.posCard, flex: 2 }}>
                <h2 style={{marginTop: 0, color: '#10b981'}}>New Sale</h2>
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
                      <select style={{width: '100%', padding: '12px', borderRadius: '6px', background: '#0f172a', color: 'white', border: '1px solid #10b981', fontWeight: 'bold'}} value={posForm.paymentMethod} onChange={e => setPosForm({...posForm, paymentMethod: e.target.value})} required>
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
                    <button type="submit" disabled={totalAmount === 0} style={{ padding: '15px 40px', background: totalAmount === 0 ? '#334155' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: totalAmount === 0 ? 'not-allowed' : 'pointer' }}>Mark as Paid</button>
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
          </div>
        )}

      </div>
    </div>
  );
};

export default StaffDashboard;