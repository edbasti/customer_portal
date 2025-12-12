'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Booking {
  id: string;
  jobId: string;
  title: string;
  status: string;
  scheduledDate: string;
  address: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>My Bookings</h1>
          {user && <p style={{ color: '#666' }}>Welcome, {user.name || user.email}</p>}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {bookings.length === 0 ? (
        <div className="card">
          <p>No bookings found.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '10px' }}>
                  <Link href={`/bookings/${booking.id}`} style={{ color: '#0070f3' }}>
                    {booking.title}
                  </Link>
                </h2>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  <strong>Job ID:</strong> {booking.jobId}
                </p>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  <strong>Status:</strong> {booking.status}
                </p>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  <strong>Scheduled:</strong>{' '}
                  {new Date(booking.scheduledDate).toLocaleString()}
                </p>
                <p style={{ color: '#666' }}>
                  <strong>Address:</strong> {booking.address}
                </p>
              </div>
              <Link href={`/bookings/${booking.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

