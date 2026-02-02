const mongoose = require('mongoose');

const trainerPoSchema = new mongoose.Schema({
    poId: { type: String, unique: true },
    enrollmentId: { type: String, required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trainerName: { type: String, required: true },
    paymentType: { type: String, enum: ['Hourly', 'Fixed'], required: true },
    rate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Generated', 'Sent', 'Accepted'],
        default: 'Generated'
    },
    createdAt: { type: Date, default: Date.now }
});

trainerPoSchema.pre('save', async function (next) {
    if (!this.poId) {
        const count = await mongoose.model('TrainerPO').countDocuments();
        this.poId = `TPO-${String(count + 2001).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('TrainerPO', trainerPoSchema);
