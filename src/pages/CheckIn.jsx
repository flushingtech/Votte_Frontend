import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkInToEvent } from '../api/API';

// Landing page for the QR code on the check-in slide. Requires login (routing
// through Landing and back here via postLoginRedirect if needed), then checks
// the user into the event and hands off to the event page. The backend
// check-in endpoint is already idempotent, so a repeat scan is a no-op.
function CheckIn() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('authToken');
      let email = null;
      try {
        email = JSON.parse(localStorage.getItem('user'))?.email || null;
      } catch {
        email = null;
      }
      email = email || localStorage.getItem('userEmail');

      if (!token || !email) {
        localStorage.setItem('postLoginRedirect', `/events/${eventId}/check-in`);
        navigate('/', { replace: true });
        return;
      }

      localStorage.setItem('userEmail', email);

      try {
        await checkInToEvent(eventId, email, []);
        navigate(`/event/${eventId}`, { replace: true });
      } catch (err) {
        console.error('Check-in failed:', err);
        setError(err.response?.data?.message || 'Check-in failed. Please try again.');
      }
    };

    run();
  }, [eventId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white bg-[#0F1419] px-4 text-center">
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={() => navigate(`/event/${eventId}`)}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 font-semibold transition-colors"
        >
          Go to event
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#0F1419]">
      <p>Checking you in...</p>
    </div>
  );
}

export default CheckIn;
