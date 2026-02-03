const mongoose = require('mongoose');
require('dotenv').config();

const { TrainerInvoice } = require('./models/Invoice');
const User = require('./models/User');

async function inspectInvoices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const invoices = await TrainerInvoice.find({});
        console.log(`Found ${invoices.length} TrainerInvoices`);

        for (const inv of invoices) {
            console.log(`\nInvoice: ${inv.invoiceId}`);
            console.log(`  TrainerId Value:`, inv.trainerId);
            console.log(`  TrainerId Type:`, typeof inv.trainerId);
            console.log(`  Is ObjectId?`, inv.trainerId instanceof mongoose.Types.ObjectId);

            if (inv.trainerId) {
                const user = await User.findById(inv.trainerId);
                console.log(`  Linked User found?`, !!user);
                if (user) console.log(`  User Name: ${user.name}`);
            } else {
                console.log(`  NO TRAINER ID`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectInvoices();
