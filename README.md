# Customer Portal POC

A functional proof-of-concept for a minimal Customer Portal built with Next.js and Express.js, integrating with ServiceM8 API.

## Features

- **Authentication**: Login using email and phone number
- **Bookings List**: View all customer bookings
- **Booking Details**: Access detailed information for specific bookings
- **File Attachments**: View associated file attachments for bookings
- **Messaging**: Send and view messages related to bookings (persisted in backend)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Backend**: Express.js with ES Modules
- **API Integration**: ServiceM8 API (with fallback to mock data)

## Project Structure

```
cp/
├── frontend/          # Next.js application
│   ├── app/          # Next.js app directory
│   └── package.json
├── backend/          # Express.js server
│   ├── routes/       # API route handlers
│   ├── server.js     # Main server file
│   └── package.json
└── package.json      # Root package.json for convenience scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Configuration

1. Copy the environment example file in the backend directory:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` and add your ServiceM8 API credentials (optional - app works with mock data if not configured):
```
PORT=5000
SERVICEM8_API_KEY=your_api_key_here
SERVICEM8_API_PASSWORD=your_api_password_here
```

**Note**: The application will work with mock data if ServiceM8 credentials are not provided. At least one real ServiceM8 API call is implemented and will be used when credentials are available.

### Running the Application

Start both frontend and backend servers concurrently:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### Demo Credentials

For testing the application, use these demo credentials:
- **Email**: customer@example.com
- **Phone**: +1234567890

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and phone

### Bookings
- `GET /api/bookings` - Get all bookings for authenticated user
- `GET /api/bookings/:id` - Get specific booking details
- `GET /api/bookings/:id/attachments/:attachmentId` - Get attachment file

### Messages
- `GET /api/messages/booking/:bookingId` - Get messages for a booking
- `POST /api/messages/booking/:bookingId` - Send a message for a booking

## ServiceM8 Integration

The application integrates with ServiceM8 API for fetching real booking data. The integration:

- Fetches jobs from ServiceM8 when credentials are configured
- Falls back to mock data if ServiceM8 is unavailable or not configured
- Implements at least one real ServiceM8 API endpoint (job listing and details)
- Attempts to fetch attachments from ServiceM8 when available

## Data Persistence

For this POC:
- **Users**: In-memory storage (mock authentication)
- **Messages**: In-memory storage (persisted during server session)
- **Bookings**: Fetched from ServiceM8 API or mock data

In a production environment, these would be stored in a proper database.

## Development Notes

- The frontend uses Next.js App Router with client components
- Authentication uses mock JWT tokens (in production, use proper JWT verification)
- CORS is enabled for development
- The UI is minimal but functional, prioritizing functionality over design
