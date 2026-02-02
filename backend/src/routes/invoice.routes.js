const express = require('express');
const { TrainerInvoice, ClientInvoice } = require('../models/Invoice');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// ========== TRAINER INVOICES ==========

// Get trainer invoices
router.get('/trainer', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Trainer') {
            query.trainerId = req.user._id;
        }
        if (req.user.role === 'Client') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const invoices = await TrainerInvoice.find(query).sort({ invoiceDate: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create trainer invoice (Trainer submits)
router.post('/trainer', auth, authorize('Trainer'), async (req, res) => {
    try {
        const invoice = new TrainerInvoice({
            ...req.body,
            trainerId: req.user._id,
            status: 'Created'
        });
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify/Approve trainer invoice (Admin)
router.patch('/trainer/:id/status', auth, authorize('Admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Verified', 'Approved', 'Paid'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const invoice = await TrainerInvoice.findOneAndUpdate(
            { invoiceId: req.params.id },
            { status },
            { new: true }
        );
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CLIENT INVOICES ==========

// Get client invoices
router.get('/client', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Client') {
            query.clientId = req.user._id;
        }
        if (req.user.role === 'Trainer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const invoices = await ClientInvoice.find(query).sort({ dueDate: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate client invoice (Admin)
router.post('/client', auth, authorize('Admin'), async (req, res) => {
    try {
        const { baseAmount, ...rest } = req.body;
        const tax = baseAmount * 0.18; // 18% GST
        const totalAmount = baseAmount + tax;

        const invoice = new ClientInvoice({
            ...rest,
            baseAmount,
            tax,
            totalAmount,
            status: 'Generated'
        });
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send client invoice (Admin)
router.patch('/client/:id/send', auth, authorize('Admin'), async (req, res) => {
    try {
        const invoice = await ClientInvoice.findOneAndUpdate(
            { invoiceId: req.params.id },
            { status: 'Sent' },
            { new: true }
        );
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark client invoice as paid (Admin)
router.patch('/client/:id/paid', auth, authorize('Admin'), async (req, res) => {
    try {
        const invoice = await ClientInvoice.findOneAndUpdate(
            { invoiceId: req.params.id },
            { status: 'Paid' },
            { new: true }
        );
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept client invoice (Client acknowledges receipt)
router.patch('/client/:id/accept', auth, authorize('Client'), async (req, res) => {
    try {
        const invoice = await ClientInvoice.findOne({ invoiceId: req.params.id });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Verify the client owns this invoice
        if (invoice.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only allow accepting if status is 'Sent'
        if (invoice.status !== 'Sent') {
            return res.status(400).json({ error: 'Invoice can only be accepted when status is Sent' });
        }

        invoice.status = 'Accepted';
        await invoice.save();
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
