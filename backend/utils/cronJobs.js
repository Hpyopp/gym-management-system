const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const startCronJobs = () => {

  // 1. Setup Brevo/SMTP Transporter (Function ke andar hona zaroori hai safety ke liye)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Har minute scan karega (Testing mode)
  cron.schedule('* * * * *', async () => {
    try {
      console.log('CRON: Scanning database...');

      // --- LOGIC UPGRADE: Safe Date Handling ---
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Populating Gym details
      const expiringUsers = await User.find({
        expiryDate: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
      }).populate('gymId');

      if (expiringUsers.length > 0) {
        for (let user of expiringUsers) {
          const msg = `FEES ALERT: Your gym membership expires in 3 days on ${user.expiryDate.toDateString()}.`;
          
          // Duplicate check
          const alreadySent = user.notifications.some(notif => notif.message === msg);
          
          if (!alreadySent) {
            try {
              // A. PEHLE EMAIL BHEJ (External Action)
              const mailOptions = {
                from: `"Gym System" <${process.env.EMAIL_FROM}>`,
                
                // FIX: Tere SMTP login ID ki jagah tera asli Gmail dal diya hai.
                // BRUTAL WARNING: Jab tera system live ho jaye aur asli gyms isko use karein, 
                // toh isko change karke 'user.email' kar dena, warna saare gym members ki expiry mail tere personal inbox mein aayegi!
                to: 'sashikantkhandelwal@gmail.com', 
                
                subject: `⚠️ Membership Expiry: ${user.name}`,
                html: `<b>Hello!</b> <p>${user.name} from ${user.gymId?.gymName || 'Gym'} is expiring in 3 days on ${user.expiryDate.toDateString()}.</p>`
              };

              // Agar ye line fail hui (e.g. wrong password), toh DB update nahi hoga
              await transporter.sendMail(mailOptions); 

              // B. AGAR EMAIL SUCCESS HUI, TABHI DATABASE UPDATE KAR
              await User.findByIdAndUpdate(user._id, {
                $push: { notifications: { message: msg, type: 'System Alert' } }
              });

              console.log(`CRON SUCCESS: Email + DB Update for ${user.name}`);
              
            } catch (mailError) {
              // Fail hone par yaha aayega aur block nahi hoga
              console.error(`CRON EMAIL FAILED for ${user.name}:`, mailError.message);
            }
          } else {
            console.log(`CRON BLOCKED: Spam prevented for ${user.name}`);
          }
        }
      } else {
        console.log('CRON STATUS: No memberships expiring in exactly 3 days.');
      }
    } catch (error) {
      console.error('CRON ERROR:', error.message);
    }
  });
};

module.exports = startCronJobs;