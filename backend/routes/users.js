const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const emailService = require('../services/emailService');

const router = express.Router();

// GET /users - Get all users with optional role filter
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        
        let filter = {};
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /users/stats - Get user statistics by role
router.get('/stats', async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Transform results into a more usable format
        const userStats = {
            passengers: 0,
            drivers: 0,
            admins: 0,
            total: 0
        };

        stats.forEach(stat => {
            userStats[stat._id + 's'] = stat.count;
            userStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            stats: userStats
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /users/:id - Get single user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /users - Create new user (Admin only)
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, role } = req.body;

        // Validation
        if (!firstName || !lastName || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate role if provided
        if (role && !['passenger', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Password strength validation
        const passwordRegex = /^.{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
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

        // Create new user (password will be hashed by pre-save hook)
        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: password, // Plain text password - will be hashed by pre-save hook
            role: role || 'passenger'
        });

        await newUser.save();

        // Send professional welcome email for admin-created accounts
        try {
            await emailService.sendAccountCreatedEmail(newUser);
        } catch (e) {
            console.warn('Welcome email failed:', e?.message);
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
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
        console.error('Create user error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        // Handle duplicate key error
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

// PUT /users/:id - Update user (role change is not allowed via this route)
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, role, password } = req.body;
        const userId = req.params.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate role if provided
        if (typeof role !== 'undefined' && !['passenger', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
        }

        // Prepare update object
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (typeof role !== 'undefined') updateData.role = role;

        // Handle password update if provided
        if (password) {
            const passwordRegex = /^.{6,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }
            // Don't hash here - let the model's pre-save hook handle it
            updateData.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        // Notify user if sensitive fields changed
        try {
            if (password) {
                await emailService.sendPasswordChangedEmail(updatedUser, 'admin', req);
            } else if (email && email !== user.email) {
                await sendEmail({
                    to: email,
                    subject: '📧 Email Address Updated - Transportation Hub',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Updated</title>
                            <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; }
                                .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
                                .content { padding: 40px 30px; }
                                .info-box { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin: 20px 0; }
                                .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🚌 Transportation Hub</h1>
                                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Address Updated</p>
                                </div>
                                
                                <div class="content">
                                    <p>Hi ${updatedUser.firstName},</p>
                                    
                                    <div class="info-box">
                                        <h3 style="margin-top: 0;">📧 Email Address Changed</h3>
                                        <p>Your Transportation Hub account email address has been successfully updated.</p>
                                        <p><strong>New Email:</strong> ${email}</p>
                                        <p><strong>Change Date:</strong> ${new Date().toLocaleString()}</p>
                                    </div>
                                    
                                    <p>All future communications from Transportation Hub will be sent to your new email address. Please update your records accordingly.</p>
                                    
                                    <p>If you didn't request this change, please contact our support team immediately as your account may be compromised.</p>
                                </div>
                                
                                <div class="footer">
                                    <p>© 2024 Transportation Hub. All rights reserved.</p>
                                    <p>This email was sent to ${email}. If you didn't make this change, please contact us immediately.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            }
        } catch (e) {
            console.warn('Update notification email failed:', e?.message);
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(userId);

        // Send professional account deletion notification
        try {
            await emailService.sendAccountDeletedEmail(user);
        } catch (e) {
            console.warn('Deletion email failed:', e?.message);
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
