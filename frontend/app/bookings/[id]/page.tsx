'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

interface Booking {
  id: string;
  jobId: string;
  title: string;
  status: string;
  scheduledDate: string;
  address: string;
  description: string;
  attachments: Attachment[];
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    if (params.id) {
      fetchBookingDetails();
      fetchMessages();
    }
  }, [params.id, router]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBooking(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/messages/booking/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessages(response.data);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/messages/booking/${params.id}`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessages([response.data, ...messages]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">Booking not found</div>
          <Link href="/bookings" className="btn btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href="/bookings" style={{ color: '#0070f3', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Bookings
      </Link>

      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>{booking.title}</h1>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Job ID:</strong> {booking.jobId}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Status:</strong> {booking.status}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Scheduled Date:</strong>{' '}
          {new Date(booking.scheduledDate).toLocaleString()}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Address:</strong> {booking.address}
        </div>
        {booking.description && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Description:</strong>
            <p style={{ marginTop: '5px', color: '#666' }}>{booking.description}</p>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Attachments</h2>
        {booking.attachments.length === 0 ? (
          <p style={{ color: '#666' }}>No attachments available for this booking.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {booking.attachments.map((attachment) => (
              <li
                key={attachment.id}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{attachment.name}</span>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '5px 15px', fontSize: '14px' }}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Messages Section */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Messages</h2>
        
        <form onSubmit={handleSendMessage} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Message History</h3>
          {messages.length === 0 ? (
            <p style={{ color: '#666' }}>No messages yet. Start a conversation!</p>
          ) : (
            <div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    borderLeft: '4px solid #0070f3'
                  }}
                >
                  <p style={{ marginBottom: '5px' }}>{message.content}</p>
                  <small style={{ color: '#666' }}>
                    {new Date(message.timestamp).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

