require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const paymentRoutes = require('./routes/paymentRoutes');
const planRoutes = require('./routes/planRoutes');
const storeRoutes = require('./routes/storeRoutes');
const staffRoutes = require('./routes/staffRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');


// Routes Import (Make sure path is correct based on your folder structure)
const superAdminRoutes = require('./routes/superAdminRoutes'); 

const app = express();

// ==========================================
// 1. THE FIX: TRUST PROXY (Render ke liye compulsory)
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// 2. MIDDLEWARES & SECURITY
// ==========================================
app.use(express.json());
app.use(cookieParser());

// VVIP: CORS Configuration - Cross-domain cookies ke liye
const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://gym-management-system-ebon.vercel.app' // Live Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Cookies allow karne ke liye
}));

// Rate Limiter (Spam rokne ke liye)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter); // Sirf API routes pe limiter lagaya

// ==========================================
// 3. DATABASE CONNECTION
// ==========================================
// Check if MONGODB_URI or MONGO_URI is used in your .env
const dbURI = process.env.MONGODB_URI || process.env.MONGO_URI; 

mongoose.connect(dbURI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 4. ROUTES
// ==========================================
app.use('/api/superadmin', superAdminRoutes);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/plans', planRoutes);
app.use('/api/admin', storeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('Gym Management System API is UP and RUNNING 🚀');
});

// ==========================================
// 5. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
});