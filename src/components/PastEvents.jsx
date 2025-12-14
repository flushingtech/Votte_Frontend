import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { getEvents, getUserProfile } from '../api/API';
import Navbar from './Navbar';

function PastEvents() {
  const [events, setEvents] = useState([]);
  const [dateEvents, setDateEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);

  const getEasternDate = () => {
    const eastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    eastern.setHours(0, 0, 0, 0);
    return eastern;
  };

  const todayEastern = getEasternDate();

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const all = await getEvents();
        const past = all.filter((e) => {
          const eventDate = new Date(new Date(e.event_date).toLocaleString('en-US', { timeZone: 'America/New_York' }));
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < todayEastern;
        });

        const map = {};
        past.forEach((event) => {
          const date = new Date(event.event_date).toDateString();
          if (!map[date]) map[date] = [];
          map[date].push(event);
        });

        setEvents(past.reverse());
        setDateEvents(map);
      } catch (err) {
        console.error('Error loading past events:', err);
      }
    };

    fetchPastEvents();
  }, []);

  const tileClassName = ({ date }) => {
    const key = date.toDateString();
    if (dateEvents[key]) {
      return 'highlighted-date-past';
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
      <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-orange-500 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">Past Events</h1>
          </div>
          <p className="text-gray-400 text-lg">Explore event history and memories — {events.length} events completed</p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Events Calendar</h2>

              <div className="flex justify-center">
                <Calendar
                  onClickDay={handleDateClick}
                  tileClassName={tileClassName}
                  className="rounded-lg shadow-lg p-4 bg-white text-black"
                  maxDate={new Date()}
                />
              </div>

              <style>
                {`
                  .react-calendar__tile { color: black !important; border-radius: 8px !important; transition: all 0.2s ease !important; }
                  .highlighted-date-past { background: linear-gradient(135deg, #F97316, #EA580C) !important; color: white !important; font-weight: bold; }
                  .react-calendar__tile:hover { background: #E5E7EB !important; }
                  .react-calendar__month-view__weekdays, .react-calendar__navigation button { color: black !important; }
                `}
              </style>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 shadow-2xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-orange-700/50 to-red-700/50 border-b border-orange-600/50">
                  <h2 className="text-xl font-bold">All Past Events</h2>
                </div>

                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">😔</div>
                      <h3 className="text-lg font-semibold mb-2">No past events</h3>
                      <p className="text-gray-400">Event history will appear here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => {
                        const eventDate = new Date(event.event_date);
                        const daysAgo = Math.floor((new Date() - eventDate) / (1000 * 60 * 60 * 24));

                        return (
                          <div
                            key={event.id}
                            className="p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-r from-white/5 to-gray-100/5 border-orange-500/50 hover:border-orange-400"
                            onClick={() => navigate(`/event/${event.id}`)}
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="bg-orange-500/20 border border-orange-400/50 text-orange-300 text-xs font-bold px-3 py-1 rounded-full">
                                {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {eventDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    timeZone: 'America/New_York',
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  event.stage === 3
                                    ? 'bg-green-600/50 text-green-200'
                                    : event.stage === 2
                                    ? 'bg-yellow-600/50 text-yellow-200'
                                    : 'bg-blue-600/50 text-blue-200'
                                }`}
                              >
                                {event.stage === 3 ? 'Completed' : `Stage ${event.stage || 'TBD'}`}
                              </span>

                              <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                                View Results
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedDate.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl border border-purple-700/50 shadow-2xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-700/50 to-pink-700/50 border-b border-purple-600/50">
                    <h2 className="text-xl font-bold">Selected Date Events</h2>
                  </div>

                  <div className="p-4 space-y-3">
                    {selectedDate.map((event) => (
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
                            timeZone: 'America/New_York',
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

export default PastEvents;
