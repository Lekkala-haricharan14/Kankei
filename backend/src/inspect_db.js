const mongoose = require('mongoose');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
require('dotenv').config();

async function inspectData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Users ---');
        const users = await User.find({}, 'name email role _id');
        console.log(JSON.stringify(users, null, 2));

        console.log('\n--- Enrollments ---');
        const enrollments = await Enrollment.find({});
        console.log(JSON.stringify(enrollments, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

inspectData();
