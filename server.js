const express = require('express');
const db = require('./src/config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Route imports
const userRouter = require('./src/routes/profileRouter');
const authRouter = require('./src/routes/authRouter');
const domainToolRouter = require('./src/routes/domainToolsRoutes')

// Initialize app
const app = express();

// Load environment variables
dotenv.config();


// Middleware
app.use(express.json());
app.use(cors());   
app.use(morgan('dev'));
app.use(helmet()); 

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running ✅',
  });
});


// Mount user routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/domain', domainToolRouter)


// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found ❌',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error 💥',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
