const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: 'dulmin55555@gmail.com' });
        if (existingUser) {
            console.log('✅ User already exists:', existingUser.email);
            await mongoose.disconnect();
            return;
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash('password123', 12);
        
        const user = new User({
            firstName: 'Nethshan',
            lastName: 'Dulmin',
            email: 'dulmin55555@gmail.com',
            phone: '0771234567',
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true
        });
        
        await user.save();
        console.log('✅ User created successfully:', {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createUser();
