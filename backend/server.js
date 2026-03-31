const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. CORS STRICT POLICY (UPDATED: Ab Local aur Live dono allowed hain)
const allowedOrigins = [
  'https://gym-management-system-ebon.vercel.app', // Tera asli Vercel URL
  'http://localhost:5173'                          // Tera Local testing URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. PARSERS
app.use(express.json());
app.use(cookieParser());

// 3. RATE LIMITING
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP, please try again later." }
});
app.use('/api/', apiLimiter);

// 4. ROUTES
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/pos', require('./routes/posRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));