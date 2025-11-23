import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { dateTimeFormatter } from '/src/utils/intlUtils';
import { checkInToEvent } from '../api/API';

function EventsList({ today }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // 👈 NEW
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  // 👇 NEW: listen for viewport changes (mobile < md = 768px)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener?.('change', handle);
    return () => mq.removeEventListener?.('change', handle);
  }, []);

  const toEasternDate = (dateString) => {
    const eastern = new Date(
      new Date(dateString).toLocaleString('en-US', { timeZone: 'America/New_York' })
    );
    eastern.setHours(0, 0, 0, 0);
    return eastern;
  };

  const isSameDay = (dateStr) => {
    const eventDate = toEasternDate(dateStr);
    return eventDate.getTime() === today.getTime();
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

  // --- pick candidates ---
  const recentPastEvent = events
    .filter((e) => toEasternDate(e.event_date) < today)
    .reduce((latest, e) =>
      !latest || toEasternDate(e.event_date) > toEasternDate(latest.event_date) ? e : latest
    , null);

  const nextUpcomingEvent = events
    .filter((e) => toEasternDate(e.event_date) >= today)
    .reduce((closest, e) =>
      !closest || toEasternDate(e.event_date) < toEasternDate(closest.event_date) ? e : closest
    , null);

  const eventToday = events.find((e) => isSameDay(e.event_date)) || null;

  // --- desktop (2 cards) vs mobile (1 card) ---
  const filteredEventsDesktop = [];
  if (recentPastEvent) filteredEventsDesktop.push(recentPastEvent);
  if (nextUpcomingEvent && (!recentPastEvent || nextUpcomingEvent.id !== recentPastEvent.id)) {
    filteredEventsDesktop.push(nextUpcomingEvent);
  }

  const selectedOneMobile = eventToday ?? nextUpcomingEvent ?? recentPastEvent ?? null;
  const filteredEvents = isMobile
    ? (selectedOneMobile ? [selectedOneMobile] : [])
    : filteredEventsDesktop;

  return (
    <div className="events-container relative flex flex-col">
      {/* Enhanced Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Upcoming Events</h2>
          </div>
          <div className="bg-slate-600/50 px-2 sm:px-3 py-1 rounded-full">
            <span className="text-xs sm:text-sm text-gray-200">{filteredEvents.length} active</span>
          </div>
        </div>
        <div className="mt-2 flex gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/past-events')}
            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-orange-500 hover:from-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Past Events</span>
          </button>
          
          <button
            onClick={() => navigate('/upcoming-events')}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-blue-500 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Upcoming Events</span>
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto p-1 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
        {filteredEvents.map((event) => {
          const easternDate = toEasternDate(event.event_date);
          const isEventToday = isSameDay(event.event_date);
          // Recompute "next" flag relative to the chosen list
          const isNextUpcoming =
            !isEventToday &&
            nextUpcomingEvent &&
            event.id === nextUpcomingEvent.id;

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
              className="p-3 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between relative bg-gradient-to-r from-white to-gray-50 border-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: isEventToday ? '#10B981' : isNextUpcoming ? '#3B82F6' : '#64748B',
                boxShadow: isEventToday
                  ? '0 0 20px 4px rgba(16, 185, 129, 0.3)'
                  : isNextUpcoming
                  ? '0 0 15px 3px rgba(59, 130, 246, 0.3)'
                  : '0 4px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              {isEventToday && (
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg animate-pulse">
                  🔥 LIVE TODAY
                </div>
              )}
              {isNextUpcoming && !isEventToday && (
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                  ⭐ NEXT UP
                </div>
              )}

              <div className="flex-1 pt-3 sm:pt-8 lg:pt-2 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-base font-bold text-black truncate">{event.title}</h3>
                <p className="text-gray-700 text-sm mt-1">
                  {dateTimeFormatter.format(easternDate)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3 lg:mt-0 lg:ml-4">
                <button
                  className="relative text-sm font-semibold text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg overflow-hidden group w-full sm:w-auto"
                  onClick={handleButtonClick}
                  style={{ backgroundColor: buttonColor }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative">{buttonText}</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

    </div>
  );
}

export default EventsList;
