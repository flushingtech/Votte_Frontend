import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { dateTimeFormatter } from '/src/utils/intlUtils';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/events/all-events`,
        );
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

  // Find the next upcoming event
  const currentDate = new Date();
  const nextUpcomingEvent = events.reduce((closestEvent, event) => {
    const eventDate = new Date(event.event_date);
    if (
      eventDate >= currentDate &&
      (!closestEvent || eventDate < new Date(closestEvent.event_date))
    ) {
      return event;
    }
    return closestEvent;
  }, null);

  return (
    <div
      className="p-6 mx-auto"
      style={{
        backgroundColor: '#030C18',
        maxWidth: '95%',
      }}
    >
      <h2 className="text-3xl font-bold text-center text-white mb-4">
        Upcoming Events
      </h2>
      <div
        className="events-list flex flex-col gap-4 mx-auto"
        style={{
          maxWidth: '100%',
        }}
      >
        {events.map((event) => {
          const isNextUpcoming =
            nextUpcomingEvent && event.id === nextUpcomingEvent.id;

          // Determine button text and color based on stage
          let buttonText = 'Add An Idea';
          let buttonColor = '#1E2A3A';
          if (event.stage === 2) {
            buttonText = 'Votte for a Winner';
            buttonColor = '#28A745'; // Green
          } else if (event.stage === 3) {
            buttonText = 'View Winners';
            buttonColor = '#FF5722'; // Orange
          }

          return (
            <div
              key={event.id}
              className="shadow-lg p-4 flex justify-between items-center"
              style={{
                backgroundColor: isNextUpcoming ? '#FFE4CE' : '#FFE4CE',
                height: '120px',
                border: isNextUpcoming
                  ? '2px solid white'
                  : '2px solid transparent',
                boxShadow: isNextUpcoming
                  ? '0 0 15px 5px rgba(255, 255, 255, 0.7)'
                  : 'none',
              }}
            >
              {/* Event Title and Date */}
              <div>
                <h3
                  className="text-lg font-bold text-black truncate"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  {!isNaN(Date.parse(event.event_date)) &&
                    dateTimeFormatter.format(new Date(event.event_date))}
                </p>
              </div>

              {/* Action Button */}
              <button
                className="text-base font-semibold text-white px-6 py-3 hover:opacity-90 transition-all"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  handleEventClick(event.id);
                }}
                style={{
                  backgroundColor: buttonColor,
                  border: 'none',
                  width: '200px',
                  height: '50px',
                }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventsList;
