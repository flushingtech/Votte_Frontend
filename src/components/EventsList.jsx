import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { dateTimeFormatter } from '/src/utils/intlUtils';
import { checkInToEvent } from '../api/API';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const getEasternDate = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  };

  const toEasternDate = (dateString) => {
    return new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'America/New_York' }));
  };

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

  if (loading) return <p className="text-center text-sm">Loading events...</p>;
  if (error) return <p className="text-center text-sm text-red-500">{error}</p>;

  const currentDate = getEasternDate();

  const isToday = (date) => {
    const eventDate = toEasternDate(date);
    eventDate.setDate(eventDate.getDate() - 1); // Subtract 1 day
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const recentPastEvent = events
    .filter((event) => {
      const d = toEasternDate(event.event_date);
      d.setDate(d.getDate() - 1);
      return d < currentDate;
    })
    .reduce((latest, event) => {
      const d = toEasternDate(event.event_date);
      d.setDate(d.getDate() - 1);
      return !latest || d > toEasternDate(latest.event_date) ? event : latest;
    }, null);

  const nextUpcomingEvent = events
    .filter((event) => {
      const d = toEasternDate(event.event_date);
      d.setDate(d.getDate() - 1);
      return d >= currentDate;
    })
    .reduce((closest, event) => {
      const d = toEasternDate(event.event_date);
      d.setDate(d.getDate() - 1);
      return !closest || d < toEasternDate(closest.event_date) ? event : closest;
    }, null);

  const filteredEvents = [];
  if (recentPastEvent) filteredEvents.push(recentPastEvent);
  if (
    nextUpcomingEvent &&
    (!recentPastEvent || nextUpcomingEvent.id !== recentPastEvent.id)
  ) {
    filteredEvents.push(nextUpcomingEvent);
  }

  return (
    <div className="events-container relative flex flex-col h-full">
      <div className="p-2 border shadow-md bg-[#1E2A3A] border-white sticky top-0 z-10">
        <h2 className="text-xl sm:text-lg font-bold text-white text-center">Events</h2>
      </div>

      <div className="overflow-y-auto max-h-[30vh] pt-2">
        {filteredEvents.map((event) => {
          const easternDate = toEasternDate(event.event_date);
          easternDate.setDate(easternDate.getDate() - 1); // Show 1 day earlier
          const isNextUpcoming = nextUpcomingEvent && event.id === nextUpcomingEvent.id;
          const isEventToday = isToday(event.event_date);
          const isCheckedIn = (event.checked_in || '').split(',').includes(userEmail);

          let buttonText = '';
          let buttonColor = '#1E2A3A';

          if (event.stage === 3) {
            buttonText = 'View Winners';
            buttonColor = '#FF5722';
          } else if (isCheckedIn) {
            buttonText = event.stage === 2 ? 'Vote for a Winner' : 'View Ideas';
            buttonColor = event.stage === 2 ? '#28A745' : '#1E2A3A';
          } else if (isEventToday) {
            buttonText = 'Check In';
            buttonColor = '#007BFF';
          } else {
            buttonText = 'Add An Idea';
            buttonColor = '#1E2A3A';
          }

          const handleButtonClick = async (e) => {
            e.stopPropagation();
            if (buttonText === 'Check In') {
              try {
                await checkInToEvent(event.id, userEmail);
                navigate(`/event/${event.id}?checkedIn=true`);
              } catch (err) {
                console.error('Check-in failed:', err);
                alert('Check-in failed');
              }
            } else {
              navigate(`/event/${event.id}`);
            }
          };

          return (
            <div
              key={event.id}
              className="shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between relative bg-white border-2 mb-4"
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

              <div className="flex-1 pt-8 sm:pt-2 min-w-[60%]">
                <h3 className="text-lg sm:text-sm font-bold text-black truncate">
                  {event.title}
                </h3>
                <p className="text-gray-700 text-sm sm:text-xs mt-1">
                  {dateTimeFormatter.format(easternDate)}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mt-3 sm:mt-0">
                <button
                  className="text-sm sm:text-xs font-semibold text-white px-4 py-2 sm:py-1 hover:opacity-90 transition-all truncate min-w-0"
                  onClick={handleButtonClick}
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

      <div className="mt-2 flex justify-start px-2">
        <button
          onClick={() => navigate('/past-events')}
          className="bg-[#1E2A3A] text-white text-sm px-4 py-2 border border-white rounded hover:bg-[#2d3e50] transition"
        >
          Past Events
        </button>
      </div>
    </div>
  );
}

export default EventsList;
