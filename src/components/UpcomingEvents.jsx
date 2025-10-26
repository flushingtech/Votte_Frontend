import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/API';
import Navbar from './Navbar';

function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [dateEvents, setDateEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  const getEasternDate = () => {
    const eastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    eastern.setHours(0, 0, 0, 0); // strip time
    return eastern;
  };

  const todayEastern = getEasternDate();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const all = await getEvents();
        const upcoming = all.filter(e => {
          const eventDate = new Date(new Date(e.event_date).toLocaleString('en-US', { timeZone: 'America/New_York' }));
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= todayEastern;
        });

        const map = {};
        upcoming.forEach(event => {
          const date = new Date(event.event_date).toDateString();
          if (!map[date]) map[date] = [];
          map[date].push(event);
        });

        setEvents(upcoming);
        setDateEvents(map);
      } catch (err) {
        console.error('Error loading upcoming events:', err);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const tileClassName = ({ date }) => {
    const key = date.toDateString();
    const today = new Date().toDateString();
    
    if (dateEvents[key]) {
      return key === today ? 'highlighted-date-today' : 'highlighted-date-upcoming';
    }
    return null;
  };

  const handleDateClick = (value) => {
    const key = value.toDateString();
    setSelectedDate(dateEvents[key] || []);
  };

  return (
    <div 
      className="min-h-screen text-white"
      style={{ 
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}
    >
      <Navbar />
      
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">Upcoming Events</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Explore future events and mark your calendar • {events.length} events scheduled
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Calendar Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Events Calendar</h2>
              
              <div className="flex justify-center">
                <Calendar
                  onClickDay={handleDateClick}
                  tileClassName={tileClassName}
                  className="rounded-lg shadow-lg p-4 bg-white text-black"
                  minDate={new Date()}
                />
              </div>

              <style>
                {`
                  .react-calendar__tile {
                    color: black !important;
                    border-radius: 8px !important;
                    transition: all 0.2s ease !important;
                  }

                  .highlighted-date-today {
                    background: linear-gradient(135deg, #10B981, #059669) !important;
                    color: white !important;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                  }

                  .highlighted-date-upcoming {
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8) !important;
                    color: white !important;
                    font-weight: bold;
                  }

                  .react-calendar__tile:hover {
                    background: #E5E7EB !important;
                  }

                  .react-calendar__month-view__weekdays,
                  .react-calendar__navigation button {
                    color: black !important;
                  }

                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                `}
              </style>
            </div>

            {/* Events List Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl border border-blue-700/50 shadow-2xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-700/50 to-indigo-700/50 border-b border-blue-600/50">
                  <h2 className="text-xl font-bold">All Upcoming Events</h2>
                </div>
                
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                      <p className="text-gray-400">Check back later for new events!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map(event => {
                        const eventDate = new Date(event.event_date);
                        const isToday = eventDate.toDateString() === new Date().toDateString();
                        
                        return (
                          <div
                            key={event.id}
                            className={`p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                              isToday 
                                ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500 ring-2 ring-green-400/50' 
                                : 'bg-gradient-to-r from-white/5 to-gray-100/5 border-blue-500/50 hover:border-blue-400'
                            }`}
                            onClick={() => navigate(`/event/${event.id}`)}
                          >
                            {isToday && (
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                  🔥 LIVE TODAY
                                </div>
                              </div>
                            )}
                            
                            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{eventDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  timeZone: 'America/New_York'
                                })}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                event.stage === 1 ? 'bg-blue-600/50 text-blue-200' :
                                event.stage === 2 ? 'bg-yellow-600/50 text-yellow-200' :
                                event.stage === 3 ? 'bg-green-600/50 text-green-200' :
                                'bg-gray-600/50 text-gray-200'
                              }`}>
                                Stage {event.stage || 'TBD'}
                              </span>
                              
                              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                                View Event →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Date Events */}
              {selectedDate && selectedDate.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl border border-purple-700/50 shadow-2xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-700/50 to-pink-700/50 border-b border-purple-600/50">
                    <h2 className="text-xl font-bold">Selected Date Events</h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {selectedDate.map(event => (
                      <div
                        key={event.id}
                        className="p-3 bg-white/10 rounded-lg border border-purple-500/50 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        <h3 className="font-bold text-white">{event.title}</h3>
                        <p className="text-sm text-purple-200">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'America/New_York'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingEvents;