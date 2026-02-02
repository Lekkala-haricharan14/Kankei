const express = require('express');
const TrainerPO = require('../models/TrainerPO');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all Trainer POs
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Trainer') {
            query.trainerId = req.user._id;
        }
        // Clients cannot see trainer POs
        if (req.user.role === 'Client') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pos = await TrainerPO.find(query).sort({ createdAt: -1 });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single PO
router.get('/:id', auth, async (req, res) => {
    try {
        const po = await TrainerPO.findOne({ poId: req.params.id });
        if (!po) {
            return res.status(404).json({ error: 'PO not found' });
        }
        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Trainer PO (Admin only)
router.post('/', auth, authorize('Admin'), async (req, res) => {
    try {
        const po = new TrainerPO({
            ...req.body,
            status: 'Generated'
        });
        await po.save();
        res.status(201).json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send Trainer PO (Admin)
router.patch('/:id/send', auth, authorize('Admin'), async (req, res) => {
    try {
        const po = await TrainerPO.findOneAndUpdate(
            { poId: req.params.id },
            { status: 'Sent' },
            { new: true }
        );
        if (!po) {
            return res.status(404).json({ error: 'PO not found' });
        }
        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept Trainer PO (Trainer)
router.patch('/:id/accept', auth, authorize('Trainer'), async (req, res) => {
    try {
        const po = await TrainerPO.findOneAndUpdate(
            { poId: req.params.id, trainerId: req.user._id },
            { status: 'Accepted' },
            { new: true }
        );
        if (!po) {
            return res.status(404).json({ error: 'PO not found or not authorized' });
        }
        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
