require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const User = require('./models/User');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spaceiq';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB. Clearing old data...');
    
    await Venue.deleteMany();
    await User.deleteMany();
    await Booking.deleteMany();

    console.log('Inserting Venues...');
    const venues = await Venue.insertMany([
      { name: 'Conf A', building: 'HQ', capacity: 10, status: 'Available', svgId: 'conf-a', x: 50, y: 50, width: 200, height: 150 },
      { name: 'Conf B', building: 'HQ', capacity: 20, status: 'Available', svgId: 'conf-b', x: 270, y: 50, width: 200, height: 150 },
      { name: 'Studio', building: 'HQ', capacity: 5, status: 'Available', svgId: 'studio', x: 50, y: 220, width: 150, height: 200 },
      { name: 'Desk 1', building: 'HQ', capacity: 1, status: 'Available', svgId: 'desk-1', x: 250, y: 220, width: 80, height: 80 },
      { name: 'Desk 2', building: 'HQ', capacity: 1, status: 'Available', svgId: 'desk-2', x: 350, y: 220, width: 80, height: 80 }
    ]);

    console.log('Inserting Users...');
    const users = await User.insertMany([
      { name: 'Alice Smith', email: 'alice@example.com', password: 'password123', role: 'Student' },
      { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123', role: 'Faculty' },
      { name: 'Charlie Davis', email: 'charlie@example.com', password: 'password123', role: 'Student' }
    ]);

    console.log('Inserting Bookings...');
    const startOfDay = new Date();
    startOfDay.setHours(9, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(17, 0, 0, 0);
    
    await Booking.insertMany([
      {
        user: users[0]._id, // Alice
        venue: venues.find(v => v.svgId === 'desk-1')._id,
        startTime: startOfDay,
        endTime: endOfDay,
        status: 'Approved',
        priority: 1
      },
      {
        user: users[1]._id, // Bob
        venue: venues.find(v => v.svgId === 'conf-b')._id,
        startTime: startOfDay,
        endTime: endOfDay,
        status: 'Approved',
        priority: 2
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedData();
