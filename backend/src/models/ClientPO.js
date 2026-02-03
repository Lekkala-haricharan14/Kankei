const mongoose = require('mongoose');

const clientPoSchema = new mongoose.Schema({
    poId: { type: String, unique: true },
    enrollmentId: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    technology: { type: String, required: true },
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cost: { type: Number, required: true },
    paymentTerms: { type: String, required: true },
    status: {
        type: String,
        enum: ['Submitted', 'Accepted', 'Rejected'],
        default: 'Submitted'
    },
    // Commission and Trainer PO fields (set when accepted)
    commissionPercent: { type: Number },
    commissionAmount: { type: Number },
    trainerAmount: { type: Number },
    trainerPoId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

clientPoSchema.pre('save', async function (next) {
    if (!this.poId) {
        const count = await mongoose.model('ClientPO').countDocuments();
        this.poId = `CPO-${String(count + 1001).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('ClientPO', clientPoSchema);
