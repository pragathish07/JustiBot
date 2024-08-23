const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { protect } = require('./middleware/auth');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors());


// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json()); // For parsing application/json

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', protect, chatRoutes); // Protect chat routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
