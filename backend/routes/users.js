const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../../../../../Pictures/Public-Transportation-Management-System/backend/utils/mailer');

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

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            role: role || 'passenger'
        });

        await newUser.save();

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

// PUT /users/:id - Update user
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
        if (role && !['passenger', 'driver', 'admin'].includes(role)) {
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
        if (role) updateData.role = role;

        // Handle password update if provided
        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character'
                });
            }
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        // Notify user if sensitive fields changed
        try {
            if (password) {
                await sendEmail({
                    to: updatedUser.email,
                    subject: 'Your password was changed',
                    html: `<p>Hi ${updatedUser.firstName},</p><p>Your password was recently changed by an administrator or via profile update. If this wasn't you, contact support immediately.</p>`
                });
            } else if (email && email !== user.email) {
                await sendEmail({
                    to: email,
                    subject: 'Your email was updated',
                    html: `<p>Hi ${updatedUser.firstName},</p><p>Your account email was changed to this address.</p>`
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

        try {
            await sendEmail({
                to: user.email,
                subject: 'Your account has been deleted',
                html: `<p>Hi ${user.firstName},</p><p>Your account has been deleted. If this was a mistake, please contact support.</p>`
            });
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
