import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [currentPlanOnDB, setCurrentPlanOnDB] = useState(''); 
  const navigate = useNavigate();

  // 🔥 THE FIX: Get gymCode from localStorage instead of gymId
  const gymCode = localStorage.getItem('gymCode'); 
  const token = localStorage.getItem('token');
  
  // Local testing URL (Change to Render URL when deploying)
  const BASE_URL = 'http://localhost:5000/api/payment';

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!gymCode || !token) return;
      try {
        // 🔥 THE FIX: Hitting the correct secure Admin endpoint instead of SuperAdmin
        const res = await axios.get(`http://localhost:5000/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if(res.data && res.data.currentPlan) {
            setCurrentPlanOnDB(res.data.currentPlan); 
        }
      } catch (error) {
        console.error("Plan Fetch Error. Ensure you are logged in as Admin:", error);
      }
    };
    fetchCurrentPlan();
  }, [gymCode, token]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planType, price) => {
    if (!gymCode) {
      alert("Error: Tenant Code not found. Please log in to your Admin Dashboard first.");
      navigate('/');
      return;
    }

    setLoadingPlan(planType);
    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      setLoadingPlan(null);
      return;
    }

    try {
      const { data: { key } } = await axios.get(`${BASE_URL}/get-key`);
      
      // 🔥 Sending gymCode instead of gymId
      const orderData = await axios.post(`${BASE_URL}/create-order`, { planType, gymCode });
      
      const options = {
        key: key, 
        amount: orderData.data.amount,
        currency: "INR",
        name: "GymOS Technologies",
        description: `Upgrade to ${planType} Plan`,
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${BASE_URL}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gymCode: gymCode, // 🔥 Sending gymCode here too
              newPlan: planType
            });

            if (verifyRes.data.success) {
              alert(`🎉 Payment Successful! Welcome to the ${planType} Plan.`);
              navigate('/admin'); // Redirect back to dashboard
            }
          } catch (err) {
            alert("Payment is processing in the background. It will reflect shortly.");
          }
        },
        prefill: {
            name: localStorage.getItem('ownerName') || '', 
            contact: localStorage.getItem('phone') || ''
        },
        theme: { color: "#fbbf24" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Error initiating payment. Try again later.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const renderActionButton = (planName) => {
    const isCurrentPlan = currentPlanOnDB === planName;

    if (isCurrentPlan) {
      return (
        <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', marginTop: '20px', fontWeight: 'bold', cursor: 'not-allowed' }}>
          Active Plan
        </button>
      );
    }

    return (
      <button onClick={() => handleCheckout(planName, planName === 'Pro' ? 999 : 1499)} disabled={loadingPlan === planName} style={{ width: '100%', padding: '15px', backgroundColor: planName === 'Elite' ? '#fbbf24' : '#3b82f6', color: planName === 'Elite' ? '#000' : '#fff', border: 'none', borderRadius: '10px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
        {loadingPlan === planName ? 'Processing...' : `Upgrade to ${planName}`}
      </button>
    );
  };

  return (
    <div style={{ padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: '#f8fafc' }}>Upgrade Your Network</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Choose the software plan that scales with your gym's growth.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* STARTER */}
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '300px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#94a3b8', marginTop: 0, fontSize: '1.4rem' }}>Starter</h2>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#fff' }}>₹499<span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span></h1>
          <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2.5', fontSize: '0.95rem' }}>
            <li>✅ Basic Dashboard Access</li>
            <li>✅ Member Registration</li>
            <li>✅ Manual Expiry Tracking</li>
            <li>❌ Store / POS System</li>
            <li>❌ WhatsApp Reminders</li>
          </ul>
          {renderActionButton('Starter')}
        </div>

        {/* PRO */}
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '300px', border: '1px solid #3b82f6' }}>
          <h2 style={{ color: '#60a5fa', marginTop: 0, fontSize: '1.4rem' }}>Pro</h2>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#fff' }}>₹999<span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span></h1>
          <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2.5', fontSize: '0.95rem' }}>
            <li>✅ Everything in Starter</li>
            <li>✅ Store & Inventory POS</li>
            <li>✅ Diet & Workout Engine</li>
            <li>✅ 1-Click WhatsApp Alerts</li>
            <li>❌ Staff Login Portals</li>
          </ul>
          {renderActionButton('Pro')}
        </div>

        {/* ELITE */}
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '300px', border: '1px solid #fbbf24' }}>
          <h2 style={{ color: '#fbbf24', marginTop: 0, fontSize: '1.4rem' }}>Elite</h2>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#fff' }}>₹1499<span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span></h1>
          <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2.5', fontSize: '0.95rem' }}>
            <li>✅ Everything in Pro</li>
            <li>✅ QR Code Scanner Check-in</li>
            <li>✅ Staff Accounts (Reception)</li>
            <li>✅ Live Financial Ledger</li>
            <li>✅ Premium Support</li>
          </ul>
          {renderActionButton('Elite')}
        </div>

      </div>
    </div>
  );
};

export default Pricing;