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
    <div className="events-container relative flex flex-col h-full">
      {/* Sticky Header Container */}
      <div
        className="p-4 border shadow-md"
        style={{
          backgroundColor: '#D6D6D6',
          border: '2px solid white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 className="text-xl font-bold text-black text-center">Events</h2>
      </div>

      {/* Scrollable Events List with Matching Background */}
      <div className="overflow-y-auto" style={{ maxHeight: '30vh', paddingTop: '10px' }}>
        {filteredEvents.map((event, index) => {
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
                backgroundColor: '#D6D6D6', // Matches Liked Ideas background
                height: '100px',
                marginBottom: index !== filteredEvents.length - 1 ? '15px' : '0px', // Adds space between events
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
                <p className="text-gray-700 text-sm mt-2">
                  {!isNaN(Date.parse(event.event_date)) &&
                    dateTimeFormatter.format(new Date(event.event_date))}
                </p>
              </div>

              {/* Action Button */}
              <button
                className="text-base font-semibold text-white px-6 py-3 hover:opacity-90 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event.id);
                }}
                style={{
                  backgroundColor: buttonColor,
                  border: 'none',
                  width: '180px',
                  height: '45px',
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
