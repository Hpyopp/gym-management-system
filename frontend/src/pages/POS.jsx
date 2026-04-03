import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './POS.css';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [gymData, setGymData] = useState(null);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [lastInvoice, setLastInvoice] = useState(null);

  const API_URL = 'http://localhost:5000/api/pos';
  const TEST_GYM_ID = '60d5ec49f1b2c8b1f8e4e1a1'; // Make sure this ID actually exists in your DB!

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/data?gymId=${TEST_GYM_ID}`);
      setProducts(res.data.products);
      setGymData(res.data.gym);
    } catch (error) {
      console.error("Failed to load data");
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      setCart(cart.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, mrp: product.mrp, gymPrice: product.gymPrice, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => setCart(cart.filter(item => item.productId !== productId));

  // Customer pays MRP, Gym pays GymPrice
  const customerTotal = cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const walletDeduction = cart.reduce((acc, item) => acc + (item.gymPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!customerName) return alert("Enter Customer Name!");
    
    // Frontend prediction to save API call
    if (gymData.walletBalance < walletDeduction) {
      return alert(`Low Wallet Balance! You need ₹${walletDeduction} but have ₹${gymData.walletBalance}.`);
    }

    try {
      const payload = { gymId: TEST_GYM_ID, customerName, items: cart, paymentMode: 'Cash/UPI' };
      const res = await axios.post(`${API_URL}/generate-bill`, payload);
      
      setLastInvoice(res.data.invoice);
      setCart([]); setCustomerName('');
      fetchData(); // Refresh wallet balance automatically
    } catch (error) {
      alert(error.response?.data?.message || "Checkout Failed");
    }
  };

  const handlePrint = () => window.print();
  const startNewBill = () => setLastInvoice(null);

  return (
    <div className="pos-container">
      {/* WALLET HEADER */}
      <div className="wallet-header no-print" style={{ background: '#111', padding: '15px', display: 'flex', justifyContent: 'space-between', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
        <h3>🏢 {gymData?.gymName || 'Loading...'}</h3>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Prepaid Wallet Balance</p>
          <h2 style={{ margin: 0, color: gymData?.walletBalance < 1000 ? '#ef4444' : '#10b981' }}>
            ₹{gymData?.walletBalance || 0}
          </h2>
        </div>
      </div>

      <div className="pos-dashboard no-print">
        {/* LEFT: Store */}
        <div className="products-section">
          <h2>Retail Store</h2>
          <div className="product-grid">
            {products.map(p => (
              <div key={p._id} className="product-card" onClick={() => addToCart(p)}>
                <img src={p.image} alt={p.name} className="product-img" onError={(e) => { e.target.src = "https://via.placeholder.com/150" }} />
                <h4>{p.name}</h4>
                <p className="price">MRP: ₹{p.mrp}</p>
                <small style={{color: '#f59e0b'}}>Your Cost: ₹{p.gymPrice}</small>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className="cart-section">
          {lastInvoice ? (
            <div className="success-state">
              <h2 className="success-icon">✅ Billed Successfully</h2>
              <p className="customer-text">Collect from Customer: {lastInvoice.customerName}</p>
              <h1 className="success-amount">₹{lastInvoice.grandTotal.toFixed(2)}</h1>
              <p style={{color: '#ef4444'}}>Deducted from Wallet: ₹{walletDeduction}</p>
              <button className="btn-print" onClick={handlePrint} style={{width:'100%', padding:'15px', background:'#f59e0b', color:'#fff', border:'none', borderRadius:'6px', margin:'10px 0'}}>🖨️ Print Receipt</button>
              <button className="btn-new-bill" onClick={startNewBill} style={{width:'100%', padding:'15px', background:'#333', color:'#fff', border:'none', borderRadius:'6px'}}>➕ New Bill</button>
            </div>
          ) : (
            <>
              <h2>Current Bill</h2>
              <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="checkout-input" />
              
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item" style={{display:'flex', justifyContent:'space-between', background:'#222', padding:'10px', marginBottom:'5px'}}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.mrp * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="cart-summary" style={{marginTop:'20px', borderTop:'1px solid #444', paddingTop:'10px'}}>
                <div style={{display:'flex', justifyContent:'space-between', color:'#aaa'}}><p>Customer Pays (MRP)</p><p>₹{customerTotal}</p></div>
                <div style={{display:'flex', justifyContent:'space-between', color:'#f59e0b'}}><p>Wallet Deduction (Your Cost)</p><p>- ₹{walletDeduction}</p></div>
                <h3 style={{textAlign:'right', color:'#10b981'}}>Gym Profit: ₹{customerTotal - walletDeduction}</h3>
              </div>

              <button className="btn-checkout" onClick={handleCheckout} style={{width:'100%', background:'#3b82f6', color:'#fff', padding:'15px', border:'none', borderRadius:'6px', fontWeight:'bold', marginTop:'15px'}}>
                COLLECT ₹{customerTotal} & DEDUCT WALLET
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;