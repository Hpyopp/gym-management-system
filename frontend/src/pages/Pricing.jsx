import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [currentPlanOnDB, setCurrentPlanOnDB] = useState(''); // 🔥 DB ka asli plan save karne ke liye 🔥
  const navigate = useNavigate();

  // Make sure this is fetching the correct logged-in Gym's ID
  const gymId = localStorage.getItem('gymId') || 'PLACEHOLDER_GYM_ID'; 
  const BASE_URL = 'https://gym-management-system-ngbu.onrender.com/api/payment';

  useEffect(() => {
    // 1. Fetch the actual current plan from the server when page loads
    const fetchCurrentPlan = async () => {
      if (gymId === 'PLACEHOLDER_GYM_ID') return;
      try {
        // We can reuse the SuperAdmin's get insights endpoint, or create a simple /api/gym/me
        // Assuming your backend has an endpoint like this. If not, this is critical.
        const res = await axios.get(`https://gym-management-system-ngbu.onrender.com/api/superadmin/gyms/${gymId}/insights`);
        
        // This is based on the assumption your GET api now returns the plan name. 
        // If not, Level 3 fix will handle it properly via req.user scoping.
        if(res.data && res.data.gymPlan) {
            setCurrentPlanOnDB(res.data.gymPlan); // Save the actual name e.g., 'Elite'
        }
      } catch (error) {
        console.error("Plan Fetch Error:", error);
      }
    };
    fetchCurrentPlan();
  }, [gymId]);

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
    if (gymId === 'PLACEHOLDER_GYM_ID') {
      alert("Error: Gym ID not found. Please log in properly.");
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
      // 1. Fetch Public Key dynamically from backend (No Hardcoding)
      const { data: { key } } = await axios.get(`${BASE_URL}/get-key`);
      
      // 2. Create Order
      const orderData = await axios.post(`${BASE_URL}/create-order`, { planType, gymId });
      
      // 3. Initialize Razorpay Checkout
      const options = {
        key: key, 
        amount: orderData.data.amount,
        currency: "INR",
        name: "GymOS Technologies",
        description: `Upgrade to ${planType} Plan`,
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            // Frontend Verification for instant UI update
            const verifyRes = await axios.post(`${BASE_URL}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gymId: gymId,
              newPlan: planType
            });

            if (verifyRes.data.success) {
              alert(`🎉 Payment Successful! Welcome to ${planType}.`);
              // Reload page to reflect new plan status
              window.location.reload();
            }
          } catch (err) {
            alert("Payment is processing in the background. It will reflect shortly.");
          }
        },
        prefill: {
            name: localStorage.getItem('ownerName') || '', // Pre-fill if possible
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

  // 🔥 Helper function to render the correct button 🔥
  const renderActionButton = (planName) => {
    // Check if this plan is the one currently saved in DB
    const isCurrentPlan = currentPlanOnDB === planName;

    if (isCurrentPlan) {
      return (
        <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', marginTop: '20px', fontWeight: 'bold', cursor: 'not-allowed' }}>
          Current Plan
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
            <li>✅ Up to 100 Members</li><li>✅ Basic Attendance</li><li>❌ Staff Portal</li><li>❌ Dietary Protocols</li>
          </ul>
          {renderActionButton('Starter')}
        </div>

        {/* PRO */}
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '300px', border: '1px solid #3b82f6' }}>
          <h2 style={{ color: '#60a5fa', marginTop: 0, fontSize: '1.4rem' }}>Pro</h2>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#fff' }}>₹999<span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span></h1>
          <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2.5', fontSize: '0.95rem' }}>
            <li>✅ Up to 500 Members</li><li>✅ Advanced QR Scanning</li><li>✅ 1 Staff Account</li><li>✅ Standard Diet Plans</li>
          </ul>
          {renderActionButton('Pro')}
        </div>

        {/* ELITE */}
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '300px', border: '1px solid #fbbf24' }}>
          <h2 style={{ color: '#fbbf24', marginTop: 0, fontSize: '1.4rem' }}>Elite</h2>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#fff' }}>₹1499<span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span></h1>
          <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2.5', fontSize: '0.95rem' }}>
            <li>✅ Unlimited Members</li><li>✅ Face/Biometric Sync</li><li>✅ Unlimited Staff Accounts</li><li>✅ Custom Nutrition & Workouts</li>
          </ul>
          {renderActionButton('Elite')}
        </div>

      </div>
    </div>
  );
};

export default Pricing;