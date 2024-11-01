import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/all-events`);
        setEvents(response.data.events);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="p-10" style={{ backgroundColor: '#030C18' }}>
      <h2 className="text-3xl font-bold text-center text-white mb-6">Upcoming Events</h2>
      <div
        className="events-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto"
        style={{ maxWidth: '75%', paddingRight: '1rem' }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event.id)}
            className="shadow-lg rounded-sm p-4 cursor-pointer"
            style={{ backgroundColor: '#FFE4CE' }}
          >
            <h3 className="text-xl font-bold text-black">{event.title}</h3>
            <p className="text-gray-500 text-xs mt-0">{new Date(event.event_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventsList;
