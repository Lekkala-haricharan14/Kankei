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

        // Create Admin User
        const admin = await User.create({
            name: 'Kankei Admin',
            email: 'admin@kankei.in',
            password: 'admin123',
            role: 'Admin',
            status: 'approved'
        });

        // Create Trainer Users
        const trainer1 = await User.create({
            name: 'Rajesh Kumar',
            email: 'rajesh@trainer.com',
            password: 'trainer123',
            role: 'Trainer',
            status: 'approved',
            phone: '+91 9876543210',
            experience: '8',
            expertise: 'Angular, TypeScript, Node.js'
        });

        const trainer2 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@trainer.com',
            password: 'trainer123',
            role: 'Trainer',
            status: 'approved',
            phone: '+91 9876543211',
            experience: '6',
            expertise: 'React, JavaScript, Web Development'
        });

        const trainer3 = await User.create({
            name: 'Amit Patel',
            email: 'amit@trainer.com',
            password: 'trainer123',
            role: 'Trainer',
            status: 'approved',
            phone: '+91 9876543212',
            experience: '10',
            expertise: 'Java, Spring Boot, Microservices'
        });

        // Create Client Users
        const client1 = await User.create({
            name: 'Spoorthy',
            email: 'hr@spoorthy.com',
            password: 'client123',
            role: 'Client',
            status: 'approved',
            companyName: 'Spoorthy',
            companySize: '100-200',
            industry: 'IT Services'
        });

        const client2 = await User.create({
            name: 'Nayani',
            email: 'hr@nayani.com',
            password: 'client123',
            role: 'Client',
            status: 'approved',
            companyName: 'Nayani Corp',
            companySize: '50-100',
            industry: 'Consulting'
        });

        const client3 = await User.create({
            name: 'Tech Corp',
            email: 'hr@techcorp.com',
            password: 'client123',
            role: 'Client',
            status: 'approved',
            companyName: 'Tech Corp',
            companySize: '201-500',
            industry: 'Technology'
        });

        console.log('✅ Users created (1 Admin, 3 Trainers, 3 Clients)');

        // Create Enrollments with various statuses
        const enr1 = await Enrollment.create({
            clientId: client1._id,
            clientName: 'Spoorthy',
            technology: 'Angular Development',
            trainerId: trainer1._id,
            trainerName: 'Rajesh Kumar',
            duration: '5 days',
            startDate: new Date('2026-02-03'),
            endDate: new Date('2026-02-07'),
            numberOfPeople: 20,
            trainingMode: 'Hybrid',
            location: 'Bangalore Office',
            budget: 50000,
            status: 'Ongoing'
        });

        const enr2 = await Enrollment.create({
            clientId: client1._id,
            clientName: 'Spoorthy',
            technology: 'Node.js Backend',
            trainerId: trainer1._id,
            trainerName: 'Rajesh Kumar',
            duration: '7 days',
            startDate: new Date('2026-02-10'),
            endDate: new Date('2026-02-16'),
            numberOfPeople: 15,
            trainingMode: 'Online',
            budget: 60000,
            status: 'Approved'
        });

        const enr3 = await Enrollment.create({
            clientId: client2._id,
            clientName: 'Nayani',
            technology: 'React Web Development',
            trainerId: trainer2._id,
            trainerName: 'Priya Sharma',
            duration: '6 days',
            startDate: new Date('2026-02-20'),
            endDate: new Date('2026-02-25'),
            numberOfPeople: 12,
            trainingMode: 'Offline',
            location: 'Chennai Office',
            budget: 45000,
            status: 'Requested'
        });

        const enr4 = await Enrollment.create({
            clientId: client3._id,
            clientName: 'Tech Corp',
            technology: 'Java Spring Boot',
            trainerId: trainer3._id,
            trainerName: 'Amit Patel',
            duration: '8 days',
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-08'),
            numberOfPeople: 25,
            trainingMode: 'Hybrid',
            location: 'Mumbai Office',
            budget: 80000,
            status: 'Approved'
        });

        const enr5 = await Enrollment.create({
            clientId: client2._id,
            clientName: 'Nayani',
            technology: 'Python Data Science',
            trainerId: trainer2._id,
            trainerName: 'Priya Sharma',
            duration: '5 days',
            startDate: new Date('2026-03-10'),
            endDate: new Date('2026-03-14'),
            numberOfPeople: 10,
            trainingMode: 'Online',
            budget: 55000,
            status: 'Requested'
        });

        console.log('✅ Enrollments created:', enr1.enrollmentId, enr2.enrollmentId, enr3.enrollmentId, enr4.enrollmentId, enr5.enrollmentId);

        // Create Client POs with various statuses
        const cpo1 = await ClientPO.create({
            enrollmentId: enr1.enrollmentId,
            clientId: client1._id,
            clientName: 'Spoorthy',
            technology: 'Angular Development',
            duration: '5 days',
            startDate: enr1.startDate,
            endDate: enr1.endDate,
            cost: 50000,
            paymentTerms: 'Net 30',
            status: 'Accepted',
            commissionPercent: 20,
            trainerPoId: 'TPO-2001'
        });

        const cpo2 = await ClientPO.create({
            enrollmentId: enr2.enrollmentId,
            clientId: client1._id,
            clientName: 'Spoorthy',
            technology: 'Node.js Backend',
            duration: '7 days',
            startDate: enr2.startDate,
            endDate: enr2.endDate,
            cost: 60000,
            paymentTerms: 'Net 45',
            status: 'Submitted'
        });

        const cpo3 = await ClientPO.create({
            enrollmentId: enr4.enrollmentId,
            clientId: client3._id,
            clientName: 'Tech Corp',
            technology: 'Java Spring Boot',
            duration: '8 days',
            startDate: enr4.startDate,
            endDate: enr4.endDate,
            cost: 80000,
            paymentTerms: 'Net 30',
            status: 'Accepted',
            commissionPercent: 20,
            trainerPoId: 'TPO-2002'
        });

        console.log('✅ Client POs created:', cpo1.poId, cpo2.poId, cpo3.poId);

        // Create Trainer POs with various statuses
        const tpo1 = await TrainerPO.create({
            enrollmentId: enr1.enrollmentId,
            trainerId: trainer1._id,
            trainerName: 'Rajesh Kumar',
            paymentType: 'Fixed',
            rate: 500,
            totalAmount: 40000,
            status: 'Sent'
        });

        const tpo2 = await TrainerPO.create({
            enrollmentId: enr4.enrollmentId,
            trainerId: trainer3._id,
            trainerName: 'Amit Patel',
            paymentType: 'Fixed',
            rate: 600,
            totalAmount: 64000,
            status: 'Generated'
        });

        console.log('✅ Trainer POs created:', tpo1.poId, tpo2.poId);

        // Create Trainer Invoices with various statuses
        const tinv1 = await TrainerInvoice.create({
            enrollmentId: enr1.enrollmentId,
            trainerPoId: tpo1.poId,
            trainerId: trainer1._id,
            hoursWorked: 40,
            amount: 40000,
            status: 'Approved',
            clientInvoiceCreated: true
        });

        const tinv2 = await TrainerInvoice.create({
            enrollmentId: enr2.enrollmentId,
            trainerPoId: 'TPO-2003',
            trainerId: trainer1._id,
            hoursWorked: 35,
            amount: 35000,
            status: 'Created',
            clientInvoiceCreated: false
        });

        const tinv3 = await TrainerInvoice.create({
            enrollmentId: enr4.enrollmentId,
            trainerPoId: tpo2.poId,
            trainerId: trainer3._id,
            hoursWorked: 50,
            amount: 64000,
            status: 'Verified',
            clientInvoiceCreated: false
        });

        console.log('✅ Trainer Invoices created:', tinv1.invoiceId, tinv2.invoiceId, tinv3.invoiceId);

        // Create Client Invoices with various statuses (from Trainer to Client flow)
        const cinv1 = await ClientInvoice.create({
            enrollmentId: enr1.enrollmentId,
            clientPoId: cpo1.poId,
            trainerInvoiceId: tinv1.invoiceId,
            clientId: client1._id,
            baseAmount: 40000,
            tax: 7200,
            totalAmount: 47200,
            dueDate: new Date('2026-02-25'),
            status: 'Sent'
        });

        const cinv2 = await ClientInvoice.create({
            enrollmentId: enr1.enrollmentId,
            clientPoId: cpo1.poId,
            trainerInvoiceId: tinv1.invoiceId,
            clientId: client1._id,
            baseAmount: 40000,
            tax: 7200,
            totalAmount: 47200,
            dueDate: new Date('2026-03-05'),
            status: 'Accepted'
        });

        const cinv3 = await ClientInvoice.create({
            enrollmentId: enr1.enrollmentId,
            clientPoId: cpo1.poId,
            trainerInvoiceId: tinv1.invoiceId,
            clientId: client1._id,
            baseAmount: 10000,
            tax: 1800,
            totalAmount: 11800,
            dueDate: new Date('2026-03-10'),
            status: 'Generated'
        });

        const cinv4 = await ClientInvoice.create({
            enrollmentId: enr4.enrollmentId,
            clientPoId: cpo3.poId,
            trainerInvoiceId: tinv3.invoiceId,
            clientId: client3._id,
            baseAmount: 60000,
            tax: 10800,
            totalAmount: 70800,
            dueDate: new Date('2026-03-20'),
            status: 'Sent'
        });

        console.log('✅ Client Invoices created:', cinv1.invoiceId, cinv2.invoiceId, cinv3.invoiceId, cinv4.invoiceId);

        console.log('\n========================================');
        console.log('🎉 Database seeded successfully!');
        console.log('========================================');
        console.log('\n📊 Seed Summary:');
        console.log('✓ 1 Admin');
        console.log('✓ 3 Trainers');
        console.log('✓ 3 Clients');
        console.log('✓ 5 Enrollments (various statuses)');
        console.log('✓ 3 Client POs (various statuses)');
        console.log('✓ 2 Trainer POs (various statuses)');
        console.log('✓ 3 Trainer Invoices (various statuses)');
        console.log('✓ 4 Client Invoices (various statuses)');
        console.log('\n🔐 Login Credentials:');
        console.log('Admin:    admin@guvi.in / admin123');
        console.log('Trainers: rajesh@trainer.com / trainer123');
        console.log('          priya@trainer.com / trainer123');
        console.log('          amit@trainer.com / trainer123');
        console.log('Clients:  hr@spoorthy.com / client123');
        console.log('          hr@nayani.com / client123');
        console.log('          hr@techcorp.com / client123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
