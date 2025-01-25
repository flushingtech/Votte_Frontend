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

  const currentDate = new Date();

  // Helper function to check if an event is today
  const isToday = (date) => {
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  };
  // Find the most recent past event
  const recentPastEvent = events
    .filter((event) => new Date(event.event_date) < currentDate)
    .reduce((latest, event) => {
      const eventDate = new Date(event.event_date);
      if (!latest || eventDate > new Date(latest.event_date)) {
        return event;
      }
      return latest;
    }, null);

  // Find the next upcoming event
  const nextUpcomingEvent = events
    .filter((event) => new Date(event.event_date) >= currentDate)
    .reduce((closest, event) => {
      const eventDate = new Date(event.event_date);
      if (!closest || eventDate < new Date(closest.event_date)) {
        return event;
      }
      return closest;
    }, null);

  const filteredEvents = [recentPastEvent, nextUpcomingEvent].filter(Boolean);

  return (
    <div
      className="p-6 mx-auto"
      style={{
        backgroundColor: '#030C18',
        maxWidth: '95%',
      }}
    >
      <h2 className="text-3xl font-bold text-center text-white mb-4">
        Events
      </h2>
      <div
        className="events-list flex flex-col gap-4 mx-auto"
        style={{
          maxWidth: '100%',
        }}
      >
        {filteredEvents.map((event) => {
          const isNextUpcoming =
            nextUpcomingEvent && event.id === nextUpcomingEvent.id;

          const isEventToday = isToday(event.event_date);

          // Determine button text and color based on stage
          let buttonText = 'Add An Idea';
          let buttonColor = '#1E2A3A';
          if (event.stage === 2) {
            buttonText = 'Vote for a Winner';
            buttonColor = '#28A745'; // Green
          } else if (event.stage === 3) {
            buttonText = 'View Winners';
            buttonColor = '#FF5722'; // Orange
          }

          return (
            <div
              key={event.id}
              className="shadow-lg p-4 flex justify-between items-center relative"
              style={{
                backgroundColor: '#FFE4CE',
                height: '120px',
                border: isEventToday
                  ? '2px solid green'
                  : isNextUpcoming
                  ? '2px solid white'
                  : '2px solid transparent',
                boxShadow: isEventToday
                  ? '0 0 15px 3px green'
                  : isNextUpcoming
                  ? '0 0 10px 5px rgba(255, 255, 255, 0.9)'
                  : 'none',
              }}
            >
              {/* "TODAY!" Tag */}
              {isEventToday && (
                <div
                  className="absolute top-0 left-0 text-white text-xs font-bold py-1 px-3"
                  style={{
                    backgroundColor: 'green',
                    color: 'white',
                    
                  }}
                >
                  TODAY!
                </div>
              )}

              {/* "NEXT EVENT!" Tag */}
              {isNextUpcoming && !isEventToday && (
                <div
                  className="absolute top-0 left-0 text-white text-xs font-bold py-1 px-3"
                  style={{
                    background: 'linear-gradient(90deg, blue, white)',
                    backgroundSize: '200% 200%',
                    borderRadius: '0px',
                    animation: 'pulseBlueWhite 2s infinite',
                  }}
                >
                  NEXT EVENT!
                </div>
              )}

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
                  borderRadius: '3px',
                }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes pulseBlueWhite {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default EventsList;
