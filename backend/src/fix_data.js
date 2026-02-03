const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const TrainerPO = require('./models/TrainerPO');
require('dotenv').config();

async function fixData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Get the PO for ENR103
        const po = await TrainerPO.findOne({ enrollmentId: 'ENR103' });
        if (!po) {
            console.log('PO for ENR103 not found!');
            process.exit(1);
        }
        console.log(`Found PO. Trainer: ${po.trainerName} (${po.trainerId})`);

        // 2. Update Enrollment
        const result = await Enrollment.updateOne(
            { enrollmentId: 'ENR103' },
            {
                $set: {
                    trainerId: po.trainerId,
                    trainerName: po.trainerName,
                    status: 'Ongoing' // Ensure it's active
                }
            }
        );

        console.log('Update result:', result);
        console.log('✅ Fixed Enrollment link!');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixData();
