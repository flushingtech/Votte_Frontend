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

  if (loading) return <p className="text-center text-sm">Loading events...</p>;
  if (error) return <p className="text-center text-sm text-red-500">{error}</p>;

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const currentDate = new Date();

  const isToday = (date) => {
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const recentPastEvent = events
    .filter((event) => new Date(event.event_date) < currentDate)
    .reduce((latest, event) => {
      return !latest || new Date(event.event_date) > new Date(latest.event_date)
        ? event
        : latest;
    }, null);

  const nextUpcomingEvent = events
    .filter((event) => new Date(event.event_date) >= currentDate)
    .reduce((closest, event) => {
      return !closest || new Date(event.event_date) < new Date(closest.event_date)
        ? event
        : closest;
    }, null);

  const filteredEvents = [recentPastEvent, nextUpcomingEvent].filter(Boolean);

  return (
    <div className="events-container relative flex flex-col h-full">
      {/* Sticky Header */}
      <div className="p-2 border shadow-md bg-[#1E2A3A] border-white sticky top-0 z-10">
        <h2 className="text-xl sm:text-lg font-bold text-white text-center">Events</h2>
      </div>

      {/* Scrollable Events List */}
      <div className="overflow-y-auto max-h-[30vh] pt-2">
        {filteredEvents.map((event, index) => {
          const isNextUpcoming = nextUpcomingEvent && event.id === nextUpcomingEvent.id;
          const isEventToday = isToday(event.event_date);

          let buttonText = 'Add An Idea';
          let buttonColor = '#1E2A3A';
          if (event.stage === 2) {
            buttonText = 'Vote for a Winner';
            buttonColor = '#28A745';
          } else if (event.stage === 3) {
            buttonText = 'View Winners';
            buttonColor = '#FF5722';
          }

          return (
            <div
              key={event.id}
              className="shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between relative bg-white rounded-lg border-2 mb-4"
              style={{
                borderColor: isEventToday
                  ? 'green'
                  : isNextUpcoming
                  ? 'white'
                  : '#1E2A3A',
                boxShadow: isEventToday
                  ? '0 0 15px 3px green'
                  : isNextUpcoming
                  ? '0 0 10px 5px rgba(255, 255, 255, 0.9)'
                  : 'none',
              }}
            >
              {/* Labels: Bigger on mobile, smaller on desktop */}
              {isEventToday && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-sm sm:text-xs font-bold px-5 sm:px-3 py-2 sm:py-1 rounded-none">
                  TODAY!
                </div>
              )}
              {isNextUpcoming && !isEventToday && (
                <div className="absolute top-0 left-0 bg-blue-500 text-white text-sm sm:text-xs font-bold px-5 sm:px-3 py-2 sm:py-1 rounded-none">
                  NEXT EVENT!
                </div>
              )}

              {/* Event Info */}
              <div className="flex-1 pt-8 sm:pt-2 min-w-[60%]">
                <h3 className="text-lg sm:text-sm font-bold text-black truncate">
                  {event.title}
                </h3>
                <p className="text-gray-700 text-sm sm:text-xs mt-1">
                  {!isNaN(Date.parse(event.event_date)) &&
                    dateTimeFormatter.format(new Date(event.event_date))}
                </p>
              </div>

              {/* Buttons Row */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mt-3 sm:mt-0">
                <button
                  className="text-sm sm:text-xs font-semibold text-white px-4 py-2 sm:py-1 hover:opacity-90 transition-all truncate min-w-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event.id);
                  }}
                  style={{
                    backgroundColor: buttonColor,
                    borderRadius: '3px',
                  }}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventsList;
