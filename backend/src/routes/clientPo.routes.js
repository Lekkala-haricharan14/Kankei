const express = require('express');
const ClientPO = require('../models/ClientPO');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all Client POs
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Client') {
            query.clientId = req.user._id;
        }
        // Trainers cannot see client POs
        if (req.user.role === 'Trainer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pos = await ClientPO.find(query).sort({ createdAt: -1 });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single PO
router.get('/:id', auth, async (req, res) => {
    try {
        const po = await ClientPO.findOne({ poId: req.params.id });
        if (!po) {
            return res.status(404).json({ error: 'PO not found' });
        }
        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Client PO (Client submits to GUVI)
router.post('/', auth, authorize('Client'), async (req, res) => {
    try {
        const po = new ClientPO({
            ...req.body,
            clientId: req.user._id,
            clientName: req.user.name,
            status: 'Submitted'
        });
        await po.save();
        res.status(201).json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept/Reject Client PO (Admin only)
router.patch('/:id/status', auth, authorize('Admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // For rejection, just update status
        if (status === 'Rejected') {
            const po = await ClientPO.findOneAndUpdate(
                { poId: req.params.id },
                { status },
                { new: true }
            );
            if (!po) {
                return res.status(404).json({ error: 'PO not found' });
            }
            return res.json(po);
        }

        // For acceptance, we need commission and trainer details
        const { commissionPercent, trainerId, trainerName, paymentType } = req.body;

        if (commissionPercent === undefined || !trainerId || !trainerName) {
            return res.status(400).json({ error: 'Commission percent, trainer ID and name required for acceptance' });
        }

        // Find the Client PO
        const clientPo = await ClientPO.findOne({ poId: req.params.id });
        if (!clientPo) {
            return res.status(404).json({ error: 'PO not found' });
        }

        // Calculate commission and trainer amounts
        const commissionAmount = (clientPo.cost * commissionPercent) / 100;
        const trainerAmount = clientPo.cost - commissionAmount;

        // Create Trainer PO
        const TrainerPO = require('../models/TrainerPO');
        const trainerPo = new TrainerPO({
            enrollmentId: clientPo.enrollmentId,
            trainerId,
            trainerName,
            paymentType: paymentType || 'Fixed',
            rate: trainerAmount,
            totalAmount: trainerAmount,
            status: 'Generated'
        });
        await trainerPo.save();

        // Update Client PO with commission info and trainer PO reference
        clientPo.status = 'Accepted';
        clientPo.commissionPercent = commissionPercent;
        clientPo.commissionAmount = commissionAmount;
        clientPo.trainerAmount = trainerAmount;
        clientPo.trainerPoId = trainerPo.poId;
        await clientPo.save();

        res.json({ clientPo, trainerPo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

