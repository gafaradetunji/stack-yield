// Jest setup file
// Skip database setup for unit tests - mocks are used instead
// If you need real database testing, uncomment below and ensure DATABASE_URL is set

// import { prisma } from '../stack-yield-backend/src/config/db.js';
//
// beforeAll(async () => {
//   try {
//     await prisma.$connect();
//   } catch (error) {
//     console.warn('Could not connect to database:', error);
//   }
// });
//
// afterEach(async () => {
//   try {
//     await prisma.deposit.deleteMany({});
//   } catch (error) {
//     // Table might not exist or db not connected
//   }
// });
//
// afterAll(async () => {
//   try {
//     await prisma.$disconnect();
//   } catch (error) {
//     // Already disconnected
//   }
// });

