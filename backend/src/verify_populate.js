const mongoose = require('mongoose');
require('dotenv').config();

// Intentionally NOT requiring User first to see if that's the issue, 
// strictly mimicking invoice.routes.js imports (assuming User is loaded globally/elsewhere)
// But to be fair, in a standalone script we MUST require valid models to register them.
// So we will try to replicate the exact environment of the route.

const { TrainerInvoice, ClientInvoice } = require('./models/Invoice');
// We will try running find().populate() immediately.
// If valid, it should work IF 'User' model is already known to mongoose.
// In a script, we typically MUST register it. 
// But let's see if the invoices have valid ObjectIds first.

async function verifyPopulate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check raw data first
        const rawInvoices = await TrainerInvoice.find({}).limit(3).lean();
        console.log('RAW_INVOICES (First 3):');
        rawInvoices.forEach(inv => {
            console.log(`ID: ${inv.invoiceId}, trainerId: ${inv.trainerId} (${typeof inv.trainerId}), IsObject: ${typeof inv.trainerId === 'object'}`);
        });

        // Try populate WITHOUT User model explicitly loaded (might fail if not registered)
        console.log('\nAttemping populate...');
        try {
            const populated = await TrainerInvoice.find({}).populate('trainerId', 'name email').limit(3).lean();
            console.log('POPULATED_RESULT:');
            populated.forEach(inv => {
                console.log(`ID: ${inv.invoiceId}, trainerId:`, inv.trainerId);
            });
        } catch (e) {
            console.log('Populate failed:', e.message);
        }

        // Now register User and try again
        console.log('\nRegistering User model and retrying...');
        const User = require('./models/User'); // Register model
        const populated2 = await TrainerInvoice.find({}).populate('trainerId', 'name email').limit(3).lean();
        console.log('POPULATED_RESULT_AFTER_REGISTER:');
        populated2.forEach(inv => {
            console.log(`ID: ${inv.invoiceId}, trainerId:`, inv.trainerId);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyPopulate();
