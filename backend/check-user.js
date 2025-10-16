const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
        
        const user = await User.findOne({ email: 'dulmin55555@gmail.com' });
        
        if (user) {
            console.log('✅ User found:', {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                resetPasswordOTP: user.resetPasswordOTP,
                resetPasswordExpires: user.resetPasswordExpires
            });
        } else {
            console.log('❌ No user found with email: dulmin55555@gmail.com');
            console.log('📝 You need to create a user account first!');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUser();
