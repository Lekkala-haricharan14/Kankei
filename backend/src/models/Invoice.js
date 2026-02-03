const mongoose = require('mongoose');

// Trainer Invoice - Trainer submits to GUVI
const trainerInvoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, unique: true },
    enrollmentId: { type: String, required: true },
    trainerPoId: { type: String, required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hoursWorked: Number,
    amount: { type: Number, required: true },
    invoiceDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Created', 'Verified', 'Approved', 'Paid'],
        default: 'Created'
    },
    clientInvoiceCreated: { type: Boolean, default: false }
});

trainerInvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceId) {
        const count = await mongoose.model('TrainerInvoice').countDocuments();
        this.invoiceId = `TINV-${String(count + 3001).padStart(4, '0')}`;
    }
    next();
});

const TrainerInvoice = mongoose.model('TrainerInvoice', trainerInvoiceSchema);

// Client Invoice - GUVI generates for Client
const clientInvoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, unique: true },
    enrollmentId: { type: String, required: true },
    clientPoId: { type: String, required: true },
    trainerInvoiceId: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    baseAmount: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Generated', 'Sent', 'Accepted', 'Paid'],
        default: 'Generated'
    }
});

clientInvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceId) {
        const count = await mongoose.model('ClientInvoice').countDocuments();
        this.invoiceId = `CINV-${String(count + 4001).padStart(4, '0')}`;
    }
    next();
});

const ClientInvoice = mongoose.model('ClientInvoice', clientInvoiceSchema);

module.exports = { TrainerInvoice, ClientInvoice };
