import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Landing page for the QR code on the "Votte!" slide. Requires login (routing
// through Landing and back here via postLoginRedirect if needed), then hands
// off to the event page — voting UI (Stage_2) renders there automatically
// once the event is in the voting stage.
function VoteEntry() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    let email = null;
    try {
      email = JSON.parse(localStorage.getItem('user'))?.email || null;
    } catch {
      email = null;
    }
    email = email || localStorage.getItem('userEmail');

    if (!token || !email) {
      localStorage.setItem('postLoginRedirect', `/events/${eventId}/vote`);
      navigate('/', { replace: true });
      return;
    }

    localStorage.setItem('userEmail', email);
    navigate(`/event/${eventId}`, { replace: true });
  }, [eventId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#0F1419]">
      <p>Taking you to voting...</p>
    </div>
  );
}

export default VoteEntry;
