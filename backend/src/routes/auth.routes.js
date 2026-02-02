const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
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

module.exports = router;
