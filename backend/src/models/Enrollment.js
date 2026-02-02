const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    enrollmentId: { type: String, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    technology: { type: String, required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trainerName: String,
    duration: { type: String, required: true },
    budget: Number,
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Ongoing', 'Completed'],
        default: 'Requested'
    },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate enrollmentId
enrollmentSchema.pre('save', async function (next) {
    if (!this.enrollmentId) {
        const count = await mongoose.model('Enrollment').countDocuments();
        this.enrollmentId = `ENR${String(count + 101).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
