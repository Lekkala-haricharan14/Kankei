const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, companyName, companySize, industry, phone, experience, expertise } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const userData = { name, email, password, role };

        // Add role-specific fields
        if (role === 'Client') {
            if (companyName) userData.companyName = companyName;
            if (companySize) userData.companySize = companySize;
            if (industry) userData.industry = industry;
        } else if (role === 'Trainer') {
            if (phone) userData.phone = phone;
            if (experience) userData.experience = experience;
            if (expertise) userData.expertise = expertise;
        }

        const user = new User(userData);
        await user.save();

        // No token for pending users - they must wait for admin approval
        res.status(201).json({
            message: 'Registration successful. Please wait for admin approval before logging in.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check user status
        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Your account is pending admin approval. Please wait.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Your account has been rejected. Please contact support.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Get all users (Admin only)
router.get('/users', require('../middleware/auth').auth, require('../middleware/auth').authorize('Admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get trainers (for assignment)
router.get('/trainers', require('../middleware/auth').auth, async (req, res) => {
    try {
        const trainers = await User.find({ role: 'Trainer' }).select('-password');
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get clients
router.get('/clients', require('../middleware/auth').auth, async (req, res) => {
    try {
        const clients = await User.find({ role: 'Client' }).select('-password');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get pending users (Admin only)
router.get('/pending-users', require('../middleware/auth').auth, require('../middleware/auth').authorize('Admin'), async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve user (Admin only)
router.patch('/users/:id/approve', require('../middleware/auth').auth, require('../middleware/auth').authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reject user (Admin only)
router.patch('/users/:id/reject', require('../middleware/auth').auth, require('../middleware/auth').authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User rejected', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
