import express from 'express';
import axios from 'axios';

const router = express.Router();

// Mock bookings data (will be enhanced with ServiceM8 API)
const mockBookings = [
  {
    id: '1',
    jobId: 'JOB001',
    title: 'HVAC Service',
    status: 'Scheduled',
    scheduledDate: '2024-01-15T10:00:00Z',
    address: '123 Main St, City, State 12345',
    description: 'Annual HVAC maintenance and inspection',
    attachments: [
      { id: '1', name: 'quote.pdf', url: '/api/files/quote.pdf' },
      { id: '2', name: 'diagram.jpg', url: '/api/files/diagram.jpg' }
    ]
  },
  {
    id: '2',
    jobId: 'JOB002',
    title: 'Plumbing Repair',
    status: 'In Progress',
    scheduledDate: '2024-01-20T14:00:00Z',
    address: '123 Main St, City, State 12345',
    description: 'Fix leaking faucet in kitchen',
    attachments: [
      { id: '3', name: 'invoice.pdf', url: '/api/files/invoice.pdf' }
    ]
  }
];

// Middleware to verify authentication (simplified for POC)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // In production, verify JWT token
  req.userId = token.replace('mock-jwt-token-', '');
  next();
};

// Get all bookings for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    // Try to fetch from ServiceM8 API if credentials are configured
    if (process.env.SERVICEM8_API_KEY && process.env.SERVICEM8_API_PASSWORD) {
      try {
        const servicem8Response = await axios.get(
          `https://api.servicem8.com/api_1.0/job.json`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(
                `${process.env.SERVICEM8_API_KEY}:${process.env.SERVICEM8_API_PASSWORD}`
              ).toString('base64')}`
            }
          }
        );

        // Transform ServiceM8 jobs to our booking format
        const bookings = servicem8Response.data.map(job => ({
          id: job.uuid,
          jobId: job.job_number,
          title: job.name || 'Service Job',
          status: job.status_name || 'Unknown',
          scheduledDate: job.scheduled_start || job.created_at,
          address: `${job.address_1 || ''} ${job.address_2 || ''} ${job.city || ''}, ${job.state || ''} ${job.postcode || ''}`.trim(),
          description: job.description || '',
          attachments: [] // Would need separate API call for attachments
        }));

        return res.json(bookings);
      } catch (servicem8Error) {
        console.error('ServiceM8 API error:', servicem8Error.message);
        // Fall back to mock data if API fails
      }
    }

    // Return mock data if ServiceM8 is not configured or fails
    res.json(mockBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get specific booking details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Try ServiceM8 API first
    if (process.env.SERVICEM8_API_KEY && process.env.SERVICEM8_API_PASSWORD) {
      try {
        const servicem8Response = await axios.get(
          `https://api.servicem8.com/api_1.0/job/${bookingId}.json`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(
                `${process.env.SERVICEM8_API_KEY}:${process.env.SERVICEM8_API_PASSWORD}`
              ).toString('base64')}`
            }
          }
        );

        const job = servicem8Response.data;
        const booking = {
          id: job.uuid,
          jobId: job.job_number,
          title: job.name || 'Service Job',
          status: job.status_name || 'Unknown',
          scheduledDate: job.scheduled_start || job.created_at,
          address: `${job.address_1 || ''} ${job.address_2 || ''} ${job.city || ''}, ${job.state || ''} ${job.postcode || ''}`.trim(),
          description: job.description || '',
          attachments: []
        };

        // Fetch attachments if available
        try {
          const attachmentsResponse = await axios.get(
            `https://api.servicem8.com/api_1.0/job/${bookingId}/attachment.json`,
            {
              headers: {
                'Authorization': `Basic ${Buffer.from(
                  `${process.env.SERVICEM8_API_KEY}:${process.env.SERVICEM8_API_PASSWORD}`
                ).toString('base64')}`
              }
            }
          );
          booking.attachments = attachmentsResponse.data.map(att => ({
            id: att.uuid,
            name: att.filename || 'attachment',
            url: `/api/bookings/${bookingId}/attachments/${att.uuid}`
          }));
        } catch (attError) {
          console.error('Error fetching attachments:', attError.message);
        }

        return res.json(booking);
      } catch (servicem8Error) {
        console.error('ServiceM8 API error:', servicem8Error.message);
      }
    }

    // Fall back to mock data
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Get attachment file (mock for POC)
router.get('/:id/attachments/:attachmentId', authenticate, (req, res) => {
  // In a real implementation, this would fetch the actual file from ServiceM8
  res.json({
    message: 'Attachment endpoint - would fetch file from ServiceM8',
    attachmentId: req.params.attachmentId,
    bookingId: req.params.id
  });
});

export { router as bookingsRouter };

