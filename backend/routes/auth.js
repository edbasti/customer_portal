import express from 'express';

const router = express.Router();

// In-memory user store (for POC purposes)
// In production, this would be a database
const users = [
  {
    id: '1',
    email: 'customer@example.com',
    phone: '+1234567890',
    name: 'John Doe'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ error: 'Email and phone are required' });
  }

  // Find user by email and phone
  const user = users.find(u => u.email === email && u.phone === phone);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In a real app, you'd generate a JWT token here
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token: 'mock-jwt-token-' + user.id // Mock token for POC
  });
});

export { router as authRouter };

