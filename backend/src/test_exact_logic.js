const mongoose = require('mongoose');
require('dotenv').config();

const { TrainerInvoice, ClientInvoice } = require('./models/Invoice');
const User = require('./models/User');

async function testExactLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Replicate EXACT logic from GET /trainer route
        let query = {};

        // 1. Fetch Trainer Invoices with populated trainer info
        console.log('Step 1: Fetching invoices with populate...');
        const invoices = await TrainerInvoice.find(query)
            .populate('trainerId', 'name email')
            .sort({ invoiceDate: -1 })
            .lean();

        console.log(`Found ${invoices.length} invoices\n`);

        if (invoices.length > 0) {
            console.log('First invoice RAW:');
            console.log(JSON.stringify(invoices[0], null, 2));
            console.log('\ntrainerId type:', typeof invoices[0].trainerId);
            console.log('trainerId value:', invoices[0].trainerId);
        }

        // 2. Fetch all Client Invoices
        console.log('\nStep 2: Fetching client invoices...');
        const clientInvoices = await ClientInvoice.find({}, 'trainerInvoiceId').lean();
        const processedInvoiceIds = new Set(
            clientInvoices
                .filter(ci => ci.trainerInvoiceId)
                .map(ci => ci.trainerInvoiceId)
        );

        console.log(`Found ${clientInvoices.length} client invoices`);
        console.log('Processed IDs:', Array.from(processedInvoiceIds));

        // 3. Merge data
        console.log('\nStep 3: Merging data...');
        const result = invoices.map(inv => {
            const trainerObj = inv.trainerId;
            return {
                invoiceId: inv.invoiceId,
                enrollmentId: inv.enrollmentId,
                amount: inv.amount,
                status: inv.status,
                trainerName: (trainerObj && trainerObj.name) ? trainerObj.name : '-',
                clientInvoiceCreated: processedInvoiceIds.has(inv.invoiceId),
                _debug_trainerId: trainerObj
            };
        });

        console.log('\nFINAL RESULT:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testExactLogic();
