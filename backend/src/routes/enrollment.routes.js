const express = require('express');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all enrollments (Admin sees all, others see their own)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Client') {
            query.clientId = req.user._id;
        } else if (req.user.role === 'Trainer') {
            query.trainerId = req.user._id;
        }

        const enrollments = await Enrollment.find(query).sort({ createdAt: -1 });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single enrollment
router.get('/:id', auth, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ enrollmentId: req.params.id });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create enrollment (Client requests training)
router.post('/', auth, authorize('Client'), async (req, res) => {
    try {
        const enrollment = new Enrollment({
            ...req.body,
            clientId: req.user._id,
            clientName: req.user.name,
            status: 'Requested'
        });
        await enrollment.save();
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update enrollment (Admin only)
router.put('/:id', auth, authorize('Admin'), async (req, res) => {
    try {
        const enrollment = await Enrollment.findOneAndUpdate(
            { enrollmentId: req.params.id },
            req.body,
            { new: true }
        );
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign trainer to enrollment (Admin only)
router.patch('/:id/assign-trainer', auth, authorize('Admin'), async (req, res) => {
    try {
        const { trainerId, trainerName } = req.body;
        const enrollment = await Enrollment.findOneAndUpdate(
            { enrollmentId: req.params.id },
            { trainerId, trainerName, status: 'Approved' },
            { new: true }
        );
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update enrollment status
router.patch('/:id/status', auth, authorize('Admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const enrollment = await Enrollment.findOneAndUpdate(
            { enrollmentId: req.params.id },
            { status },
            { new: true }
        );
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
