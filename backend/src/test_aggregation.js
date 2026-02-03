const mongoose = require('mongoose');
require('dotenv').config();

const { TrainerInvoice, ClientInvoice } = require('./models/Invoice');
const User = require('./models/User');

async function testAggregation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check collection names
        console.log('DEBUG_COLLECTION_USER:', User.collection.name);
        console.log('DEBUG_COLLECTION_TRAINER_INVOICE:', TrainerInvoice.collection.name);
        console.log('DEBUG_COLLECTION_CLIENT_INVOICE:', ClientInvoice.collection.name);

        // Run the aggregation exactly as defined in the route
        console.log('DEBUG_START_AGGREGATION');
        const invoices = await TrainerInvoice.aggregate([
            { $sort: { invoiceDate: -1 } },
            {
                $addFields: {
                    trainerIdObj: { $toObjectId: "$trainerId" }
                }
            },
            {
                $lookup: {
                    from: 'users', // Check if this matches User.collection.name
                    localField: 'trainerIdObj',
                    foreignField: '_id',
                    as: 'trainer'
                }
            },
            {
                $lookup: {
                    from: 'clientinvoices', // Check if this matches ClientInvoice.collection.name
                    localField: 'invoiceId',
                    foreignField: 'trainerInvoiceId',
                    as: 'clientInvoice'
                }
            },
            {
                $addFields: {
                    trainerName: { $ifNull: [{ $arrayElemAt: ["$trainer.name", 0] }, "-"] },
                    clientInvoiceCreated: { $gt: [{ $size: "$clientInvoice" }, 0] },
                    // Debug helpers
                    debugTrainerCount: { $size: "$trainer" },
                    debugClientInvCount: { $size: "$clientInvoice" },
                    rawTrainerId: "$trainerId"
                }
            },
            {
                $project: {
                    invoiceId: 1,
                    trainerName: 1,
                    clientInvoiceCreated: 1,
                    debugTrainerCount: 1,
                    debugClientInvCount: 1,
                    rawTrainerId: 1
                }
            }
        ]);

        console.log('DEBUG_RESULT:', JSON.stringify(invoices.slice(0, 5), null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testAggregation();
