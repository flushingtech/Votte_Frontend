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
    <div
      className="p-6 mx-auto"
      style={{
        backgroundColor: '#030C18',
        maxWidth: '95%', // Allow the container to use more of the screen
      }}
    >
      <h2 className="text-3xl font-bold text-center text-white mb-4">Upcoming Events</h2>
      <div
        className="events-list flex flex-col gap-3 mx-auto"
        style={{
          maxWidth: '100%', // Allow events to use the full width of the container
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            className="shadow-lg p-3 flex justify-between items-center"
            style={{
              backgroundColor: '#FFE4CE',
            }}
          >
            {/* Event Title and Date */}
            <div>
              <h3
                className="text-sm font-bold text-black truncate"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {event.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(event.event_date).toLocaleDateString()}
              </p>
            </div>

            {/* View Event Button */}
            <button
              className="text-sm font-semibold bg-[#1E2A3A] text-white px-5 py-2 hover:bg-[#16202B] transition-all"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                handleEventClick(event.id);
              }}
              style={{
                border: 'none',
                width: '150px',
                height: '40px',
                borderRadius: '4px',
              }}
            >
              View Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventsList;
