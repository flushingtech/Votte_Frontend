import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { dateTimeFormatter } from '/src/utils/intlUtils';
import { checkInToEvent, checkAdminStatus } from '../api/API';

function EventsList({ today }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceledEventPopup, setCanceledEventPopup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

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

  useEffect(() => {
    const checkAdmin = async () => {
      if (userEmail) {
        try {
          const adminStatus = await checkAdminStatus(userEmail);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    checkAdmin();
  }, [userEmail]);

  if (loading) return <p className="text-center text-sm text-slate-400 py-6">Loading events...</p>;
  if (error) return <p className="text-center text-sm text-red-400 py-6">{error}</p>;

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

  // --- both events on all screen sizes ---
  const filteredEvents = [];
  if (recentPastEvent) filteredEvents.push(recentPastEvent);
  if (nextUpcomingEvent && (!recentPastEvent || nextUpcomingEvent.id !== recentPastEvent.id)) {
    filteredEvents.push(nextUpcomingEvent);
  }

  return (
    <div className="events-container relative flex flex-col">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white whitespace-nowrap truncate">Upcoming Events</h2>
          <span className="bg-slate-600/50 px-2 py-0.5 rounded-full text-[11px] text-gray-300 flex-shrink-0">
            {filteredEvents.length} active
          </span>
        </div>
        <button
          onClick={() => navigate('/upcoming-events')}
          className="flex-shrink-0 whitespace-nowrap text-[12.5px] font-semibold transition-colors"
          style={{ color: '#60a5fa' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
          onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}
        >
          View all →
        </button>
      </div>

      {/* Event rows — sized to content, no internal scroll */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        {filteredEvents.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No events to show right now.</p>
        )}
        {filteredEvents.map((event) => {
          const easternDate = toEasternDate(event.event_date);
          const isEventToday = isSameDay(event.event_date);
          const isNextUpcoming =
            !isEventToday &&
            nextUpcomingEvent &&
            event.id === nextUpcomingEvent.id;

          const isCheckedIn = (event.checked_in || '').split(',').includes(userEmail);

          let buttonText = '';
          let buttonColor = '#1E2A3A';

          if (event.canceled) {
            buttonText = 'Canceled';
            buttonColor = '#7f1d1d';
          } else if (event.stage === 3) {
            buttonText = 'View Winners';
            buttonColor = '#ea580c';
          } else if (isCheckedIn) {
            buttonText = event.stage === 2 ? 'Vote for a Winner' : 'View Ideas';
            buttonColor = event.stage === 2 ? '#16a34a' : '#334155';
          } else if (isEventToday) {
            buttonText = 'Check In';
            buttonColor = '#2563eb';
          } else {
            buttonText = 'Add An Idea';
            buttonColor = '#334155';
          }

          const monthAbbr = easternDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const dayNum = easternDate.getDate();

          const handleButtonClick = async (e) => {
            e.stopPropagation();

            if (event.canceled) {
              setCanceledEventPopup({
                title: event.title,
                reason: event.cancellation_reason || 'No reason provided',
                eventId: event.id
              });
              return;
            }

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
              onClick={() => navigate(`/event/${event.id}`)}
              className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-800/60 border rounded-lg cursor-pointer hover:border-blue-500/40 transition-colors"
              style={{
                borderColor: event.canceled
                  ? 'rgba(220,38,38,.4)'
                  : isEventToday
                    ? 'rgba(16,185,129,.4)'
                    : isNextUpcoming
                      ? 'rgba(59,130,246,.4)'
                      : 'rgba(51,65,85,.6)',
              }}
            >
              {/* Date block */}
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-md border border-blue-500/30 bg-blue-500/10 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wide leading-none">{monthAbbr}</span>
                <span className="text-base font-extrabold text-white leading-none mt-0.5">{dayNum}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-bold text-white truncate">{event.title}</h3>
                  {event.canceled ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 flex-shrink-0">Canceled</span>
                  ) : isEventToday ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 flex-shrink-0">Live today</span>
                  ) : isNextUpcoming ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 flex-shrink-0">Next up</span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {dateTimeFormatter.format(easternDate)}
                  {event.location ? ` • ${event.location}` : ''}
                </p>
              </div>

              {/* Action */}
              <button
                className="flex-shrink-0 text-xs sm:text-sm font-semibold text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:opacity-90 transition-opacity"
                onClick={handleButtonClick}
                style={{ backgroundColor: buttonColor }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Canceled Event Popup */}
      {canceledEventPopup && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setCanceledEventPopup(null)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-red-500/50 shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-white mb-3">Event Canceled</h2>
                <p className="text-gray-300 text-lg mb-2">{canceledEventPopup.title}</p>
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-400 mb-1">Cancellation Reason:</p>
                  <p className="text-white">{canceledEventPopup.reason}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate(`/event/${canceledEventPopup.eventId}`);
                      setCanceledEventPopup(null);
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg"
                  >
                    🔓 Enter as Admin
                  </button>
                )}
                <button
                  onClick={() => setCanceledEventPopup(null)}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default EventsList;
