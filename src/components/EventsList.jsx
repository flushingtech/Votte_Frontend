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
  const [isMobile, setIsMobile] = useState(false); // 👈 NEW
  const [canceledEventPopup, setCanceledEventPopup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

          if (event.canceled) {
            buttonText = 'Canceled';
            buttonColor = '#DC2626'; // Red
          } else if (event.stage === 3) {
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

            // Check if event is canceled
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
              {event.canceled ? (
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                  ❌ CANCELED
                </div>
              ) : (
                <>
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
                </>
              )}

              <div className="flex-1 pt-3 sm:pt-8 lg:pt-2 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-base font-bold text-black truncate">{event.title}</h3>
                <p className="text-gray-700 text-sm mt-1">
                  {dateTimeFormatter.format(easternDate)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3 lg:mt-0 lg:ml-4">
                <div className="relative w-full sm:w-auto">
                  <button
                    className="relative text-sm font-semibold text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg overflow-hidden group w-full"
                    onClick={handleButtonClick}
                    style={{ backgroundColor: buttonColor }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">{buttonText}</span>
                  </button>

                  {/* Floating speech bubble for canceled events */}
                  {event.canceled && (
                    <div
                      className="absolute -top-8 right-0 pointer-events-none hidden sm:block"
                      style={{
                        animation: 'float-sway 3s ease-in-out infinite'
                      }}
                    >
                      <div className="bg-white text-gray-800 text-xs rounded-xl px-3 py-2 shadow-xl border-2 border-gray-300 max-w-[250px] relative">
                        <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{event.cancellation_reason || 'No reason provided'}</p>
                        {/* Speech bubble tail */}
                        <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                        <div className="absolute -bottom-2.5 right-4 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-gray-300"></div>
                      </div>
                      <style>{`
                        @keyframes float-sway {
                          0%, 100% {
                            transform: translateY(0px) translateX(0px);
                          }
                          25% {
                            transform: translateY(-4px) translateX(2px);
                          }
                          50% {
                            transform: translateY(-8px) translateX(0px);
                          }
                          75% {
                            transform: translateY(-4px) translateX(-2px);
                          }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
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
