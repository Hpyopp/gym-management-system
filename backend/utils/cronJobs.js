const cron = require('node-cron');
const User = require('../models/User');

const startCronJobs = () => {
  // Filhal testing ke liye har minute chalega, par duplicate nahi bhejega
  cron.schedule('* * * * *', async () => {
    try {
      console.log('CRON: Scanning database...');

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const expiringUsers = await User.find({
        expiryDate: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
      });

      if (expiringUsers.length > 0) {
        for (let user of expiringUsers) {
          const msg = `FEES ALERT: Your gym membership expires in 3 days on ${user.expiryDate.toDateString()}. Please renew to avoid access restriction.`;
          
          // --- LOGIC UPGRADE: Duplicate Check ---
          // Array.some() check karega ki kya ye specific message pehle se inbox me hai
          const alreadySent = user.notifications.some(notif => notif.message === msg);
          
          if (!alreadySent) {
            await User.findByIdAndUpdate(user._id, {
              $push: { notifications: { message: msg, type: 'System Alert' } }
            });
            console.log(`CRON SUCCESS: Auto-message sent to ${user.name}`);
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