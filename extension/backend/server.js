// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const formRouter = require('./api/formRoutes');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', formRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Form Assistant Backend Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- POST /api/submit-form: Submit form data for processing`);
  console.log(`- GET /api/get-form-data: Get autofill data for forms`);
}); 