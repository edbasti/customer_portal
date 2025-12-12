import express from 'express';

const router = express.Router();

// In-memory message store (for POC purposes)
// In production, this would be a database
const messages = [];

// Middleware to verify authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = token.replace('mock-jwt-token-', '');
  next();
};

// Get messages for a specific booking
router.get('/booking/:bookingId', authenticate, (req, res) => {
  const bookingId = req.params.bookingId;
  const bookingMessages = messages.filter(m => m.bookingId === bookingId);
  res.json(bookingMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Send a message for a booking
router.post('/booking/:bookingId', authenticate, (req, res) => {
  const { content } = req.body;
  const bookingId = req.params.bookingId;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const message = {
    id: Date.now().toString(),
    bookingId,
    userId: req.userId,
    content: content.trim(),
    timestamp: new Date().toISOString()
  };

  messages.push(message);
  res.status(201).json(message);
});

export { router as messagesRouter };

