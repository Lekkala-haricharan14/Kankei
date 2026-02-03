const mongoose = require('mongoose');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const TrainerPO = require('./models/TrainerPO');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Find the logged-in trainer (User seems to be 'sita')
        const trainers = await User.find({ role: 'Trainer' });
        console.log('\n--- Trainers ---');
        trainers.forEach(t => console.log(`ID: ${t._id}, Name: ${t.name}, Email: ${t.email}`));

        // 2. Find the Enrollment ENR103
        const enr = await Enrollment.findOne({ enrollmentId: 'ENR103' });
        console.log('\n--- Enrollment ENR103 ---');
        if (enr) {
            console.log(`ID: ${enr._id}`);
            console.log(`TrainerID: ${enr.trainerId}`);
            console.log(`TrainerName: ${enr.trainerName}`);
            console.log(`Status: ${enr.status}`);
        } else {
            console.log('NOT FOUND');
        }

        // 3. Find PO for this enrollment
        const po = await TrainerPO.findOne({ enrollmentId: 'ENR103' });
        console.log('\n--- Trainer PO for ENR103 ---');
        if (po) {
            console.log(`PO ID: ${po.poId}`);
            console.log(`TrainerID in PO: ${po.trainerId}`);
            console.log(`Status: ${po.status}`);
        } else {
            console.log('NOT FOUND');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkData();
