const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User'); 
const startCronJobs = require('./utils/cronJobs');

dotenv.config();
connectDB();

const app = express();

// --- MIDDLEWARES (Must be at the top) ---
app.use(express.json());
app.use(cors());

// --- BASE ROUTE (For UptimeRobot Ping) ---
app.get('/', (req, res) => {
  res.status(200).send("Gym System Backend is Active and Running.");
});

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));

// Admin: Get All Members
app.get('/api/admin/members', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Broadcast Message
app.post('/api/admin/broadcast', async (req, res) => {
  const { message, type } = req.body;
  
  try {
    await User.updateMany({}, { 
      $push: { notifications: { message: message, type: type } } 
    });
    res.json({ success: true, message: "Message sent to all members!" });
  } catch (error) {
    console.error("Broadcast Error: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- SYSTEM WORKERS ---
startCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));