const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const ClientPO = require('./models/ClientPO');
const TrainerPO = require('./models/TrainerPO');
const { TrainerInvoice, ClientInvoice } = require('./models/Invoice');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Enrollment.deleteMany({});
        await ClientPO.deleteMany({});
        await TrainerPO.deleteMany({});
        await TrainerInvoice.deleteMany({});
        await ClientInvoice.deleteMany({});

        // Create Users
        const admin = await User.create({
            name: 'GUVI Admin',
            email: 'admin@guvi.in',
            password: 'admin123',
            role: 'Admin',
            status: 'approved'
        });

        const trainer = await User.create({
            name: 'John Doe',
            email: 'john@trainer.com',
            password: 'trainer123',
            role: 'Trainer',
            status: 'approved',
            phone: '+91 9876543210',
            experience: '5',
            expertise: 'Angular, React, Node.js'
        });

        const client = await User.create({
            name: 'Tech Corp',
            email: 'hr@techcorp.com',
            password: 'client123',
            role: 'Client',
            status: 'approved',
            companyName: 'Tech Corp',
            companySize: '201-500',
            industry: 'Technology'
        });

        console.log('✅ Users created');

        // Create Enrollments
        const enr1 = await Enrollment.create({
            clientId: client._id,
            clientName: 'Tech Corp',
            technology: 'Angular Development',
            trainerId: trainer._id,
            trainerName: 'John Doe',
            duration: '5 days',
            startDate: new Date('2026-02-05'),
            endDate: new Date('2026-02-09'),
            numberOfPeople: 15,
            trainingMode: 'Hybrid',
            location: 'Chennai Office',
            budget: 50000,
            status: 'Ongoing'
        });

        const enr2 = await Enrollment.create({
            clientId: client._id,
            clientName: 'Tech Corp',
            technology: 'React Native',
            duration: '3 days',
            startDate: new Date('2026-02-15'),
            endDate: new Date('2026-02-17'),
            numberOfPeople: 10,
            trainingMode: 'Online',
            budget: 30000,
            status: 'Requested'
        });

        console.log('✅ Enrollments created:', enr1.enrollmentId, enr2.enrollmentId);

        // Create Client PO
        const cpo1 = await ClientPO.create({
            enrollmentId: enr1.enrollmentId,
            clientId: client._id,
            clientName: 'Tech Corp',
            technology: 'Angular Development',
            duration: '5 days',
            startDate: enr1.startDate,
            endDate: enr1.endDate,
            cost: 50000,
            paymentTerms: 'Net 30',
            status: 'Accepted'
        });

        console.log('✅ Client PO created:', cpo1.poId);

        // Create Trainer PO
        const tpo1 = await TrainerPO.create({
            enrollmentId: enr1.enrollmentId,
            trainerId: trainer._id,
            trainerName: 'John Doe',
            paymentType: 'Hourly',
            rate: 1000,
            totalAmount: 40000,
            status: 'Accepted'
        });

        console.log('✅ Trainer PO created:', tpo1.poId);

        // Create Trainer Invoice
        const tinv1 = await TrainerInvoice.create({
            enrollmentId: enr1.enrollmentId,
            trainerPoId: tpo1.poId,
            trainerId: trainer._id,
            hoursWorked: 20,
            amount: 20000,
            status: 'Approved'
        });

        console.log('✅ Trainer Invoice created:', tinv1.invoiceId);

        // Create Client Invoice
        const cinv1 = await ClientInvoice.create({
            enrollmentId: enr1.enrollmentId,
            clientPoId: cpo1.poId,
            trainerInvoiceId: tinv1.invoiceId,
            clientId: client._id,
            baseAmount: 25000,
            tax: 4500,
            totalAmount: 29500,
            dueDate: new Date('2025-02-25'),
            status: 'Sent'
        });

        console.log('✅ Client Invoice created:', cinv1.invoiceId);

        console.log('\n========================================');
        console.log('🎉 Database seeded successfully!');
        console.log('========================================');
        console.log('\nLogin Credentials:');
        console.log('Admin:   admin@guvi.in / admin123');
        console.log('Trainer: john@trainer.com / trainer123');
        console.log('Client:  hr@techcorp.com / client123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
