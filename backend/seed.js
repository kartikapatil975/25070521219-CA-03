const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Book = require('./models/Book');
const ReadingSession = require('./models/ReadingSession');
const ReadingGoal = require('./models/ReadingGoal');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readsphere';

const seedData = async () => {
  try {
    console.log(`Connecting to local MongoDB for seeding: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB.');

    // Clear existing collections
    await Book.deleteMany({});
    await ReadingSession.deleteMany({});
    await ReadingGoal.deleteMany({});
    console.log('Cleared existing books, reading sessions, and goals.');

    // 1. Create Sample Books
    const booksData = [
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        totalPages: 320,
        currentPage: 320,
        status: 'Completed',
        startDate: new Date('2026-01-05'),
        completionDate: new Date('2026-01-22'),
        rating: 5,
        notes: 'An outstanding guide on tiny changes and remarkable results. The four laws of behavior change are practical and actionable.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Sci-Fi',
        totalPages: 496,
        currentPage: 496,
        status: 'Completed',
        startDate: new Date('2026-01-25'),
        completionDate: new Date('2026-02-18'),
        rating: 5,
        notes: 'Incredible sci-fi adventure! Ryland Grace and Rocky have one of the best dynamics in modern fiction. Amaze!',
        coverImage: 'https://images.unsplash.com/photo-1618609377864-68609b857e90?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        genre: 'Non-Fiction',
        totalPages: 304,
        currentPage: 185,
        status: 'Currently Reading',
        startDate: new Date('2026-02-20'),
        completionDate: null,
        rating: 4,
        notes: 'Rules for focused success in a distracted world. Transforming how I schedule study blocks.',
        coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        genre: 'Fiction',
        totalPages: 303,
        currentPage: 120,
        status: 'Currently Reading',
        startDate: new Date('2026-02-28'),
        completionDate: null,
        rating: null,
        notes: 'Poignant story about artificial intelligence, human emotion, and sacrifice.',
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        genre: 'Technology',
        totalPages: 616,
        currentPage: 95,
        status: 'Currently Reading',
        startDate: new Date('2026-02-10'),
        completionDate: null,
        rating: 5,
        notes: 'The bible for distributed systems, reliability, scalability, and maintainability.',
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        genre: 'Philosophy',
        totalPages: 252,
        currentPage: 0,
        status: 'Want to Read',
        startDate: null,
        completionDate: null,
        rating: null,
        notes: 'Recommended by my economics professor. Looking forward to reading it next month.',
        coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Sci-Fi',
        totalPages: 688,
        currentPage: 0,
        status: 'Want to Read',
        startDate: null,
        completionDate: null,
        rating: null,
        notes: 'Classic sci-fi epic. Preparing to read before watching the film adaptation.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        genre: 'Biography',
        totalPages: 656,
        currentPage: 656,
        status: 'Completed',
        startDate: new Date('2025-11-10'),
        completionDate: new Date('2025-12-28'),
        rating: 5,
        notes: 'Compelling biography detailing the intersection of humanities and technology.',
        coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80',
      },
    ];

    const insertedBooks = await Book.insertMany(booksData);
    console.log(`Inserted ${insertedBooks.length} books into 'books' collection.`);

    const deepWork = insertedBooks.find((b) => b.title === 'Deep Work');
    const klara = insertedBooks.find((b) => b.title === 'Klara and the Sun');
    const ddia = insertedBooks.find((b) => b.title === 'Designing Data-Intensive Applications');
    const atomicHabits = insertedBooks.find((b) => b.title === 'Atomic Habits');

    // 2. Create Sample Reading Sessions
    const sessionsData = [
      {
        book: atomicHabits._id,
        date: new Date('2026-01-10T18:30:00Z'),
        pagesRead: 45,
        durationMinutes: 40,
        notes: 'Read chapters 1 and 2 on habit loops.',
      },
      {
        book: atomicHabits._id,
        date: new Date('2026-01-15T20:00:00Z'),
        pagesRead: 55,
        durationMinutes: 50,
        notes: 'Great ideas on identity-based habits.',
      },
      {
        book: deepWork._id,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        pagesRead: 35,
        durationMinutes: 45,
        notes: 'Deep work vs shallow work distinctions and cognitive drain.',
      },
      {
        book: klara._id,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        pagesRead: 40,
        durationMinutes: 35,
        notes: 'Beautiful, lyrical prose describing Klara observing the street.',
      },
      {
        book: ddia._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        pagesRead: 30,
        durationMinutes: 60,
        notes: 'Studied storage engines: LSM-trees vs B-Trees.',
      },
      {
        book: deepWork._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        pagesRead: 45,
        durationMinutes: 50,
        notes: 'Rhythmic scheduling and shutdown ritual.',
      },
      {
        book: klara._id,
        date: new Date(), // today
        pagesRead: 25,
        durationMinutes: 30,
        notes: 'Morning reading session over coffee.',
      },
    ];

    const insertedSessions = await ReadingSession.insertMany(sessionsData);
    console.log(`Inserted ${insertedSessions.length} sessions into 'readingsessions' collection.`);

    // 3. Create Sample Reading Goal
    const currentYear = new Date().getFullYear();
    const goalData = new ReadingGoal({
      year: currentYear,
      targetBooks: 15,
      monthlyPageTarget: 350,
      weeklyDurationTarget: 180, // 3 hours a week
      isActive: true,
    });

    await goalData.save();
    console.log(`Inserted reading goal for year ${currentYear} into 'readinggoals' collection.`);

    console.log('\n============================================================');
    console.log('Seed completed successfully!');
    console.log('You can now open MongoDB Compass and inspect the "readsphere" database:');
    console.log('Collections created:');
    console.log('  - books (8 records)');
    console.log('  - readingsessions (7 records)');
    console.log('  - readinggoals (1 record)');
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();

