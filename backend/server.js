const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const { connectDB, getDbStatus } = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

// Allowed origins for CORS (supports frontend on :5174, :5173, etc.)
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5173',
  CLIENT_URL,
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, Postman, health checks)
      if (!origin) return callback(null, true);
      // Check explicitly allowed origins or local development origins
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local project development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome route
app.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    app: 'ReadSphere - Smart Reading Tracker API',
    version: '1.0.0',
    database: {
      type: 'Local MongoDB Community Server',
      status: dbStatus.state,
      name: dbStatus.name,
      compassUrl: 'mongodb://127.0.0.1:27017',
    },
    docs: {
      health: '/api/health',
      books: '/api/books',
      sessions: '/api/sessions',
      goals: '/api/goals',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics',
    },
  });
});

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/goals', goalRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server and Connect Database directly on configured port
let activeServer = null;

const startServer = (port = DEFAULT_PORT) => {
  activeServer = app
    .listen(port, () => {
      console.log(`\n==================================================`);
      console.log(`[ReadSphere API] Server listening on port ${port}`);
      console.log(`API URL:     http://localhost:${port}`);
      console.log(`Health:      http://localhost:${port}/api/health`);
      console.log(`Frontend:    ${CLIENT_URL}`);
      console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readsphere'}`);
      console.log(`==================================================\n`);
      connectDB();
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [Server Error] Port ${port} is already in use.`);
        console.error(`   Please verify if another process is using port ${port} or adjust PORT in backend/.env.`);
      } else {
        console.error('\n❌ [Server Error]', err.message);
      }
    });

  return activeServer;
};

// If run directly with node server.js
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
