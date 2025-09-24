const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../../../../../Pictures/Public-Transportation-Management-System/backend/utils/mailer');

const router = express.Router();

// POST /signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, confirmPassword } = req.body;

        // Validation
        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password
        });

        await newUser.save();

        // Send welcome email (non-blocking best-effort)
        try {
            await sendEmail({
                to: newUser.email,
                subject: 'Welcome to Transportation Hub',
                html: `<p>Hi ${newUser.firstName},</p><p>Welcome to Transportation Hub! Your account has been created successfully.</p>`
            });
        } catch (e) {
            console.warn('Welcome email failed:', e?.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: messages.join('. ') 
            });
        }

        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// POST /signin - Login user
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email (include password for verification)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Successful login
        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// POST /auth/forgot-password - Request OTP to email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Do not reveal whether user exists
            return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent' });
        }

        const otp = ('' + Math.floor(100000 + Math.random() * 900000));
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = expires;
        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: 'Your password reset code',
                html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
            });
        } catch (e) {
            console.warn('OTP email failed:', e?.message);
        }

        res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /auth/verify-otp - Verify email and OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const now = new Date();
        if (user.resetPasswordOTP !== otp || now > user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /auth/reset-password - Reset password with valid OTP
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;
        if (!email || !otp || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const now = new Date();
        if (user.resetPasswordOTP !== otp || now > user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Let the model pre-save hook hash the password
        user.password = password;
        user.resetPasswordOTP = null;
        user.resetPasswordExpires = null;
        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: 'Your password was changed',
                html: `<p>Hi ${user.firstName},</p><p>Your password was recently changed. If this wasn’t you, please contact support immediately.</p>`
            });
        } catch (e) {
            console.warn('Password change email failed:', e?.message);
        }

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;

