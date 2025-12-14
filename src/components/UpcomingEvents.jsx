import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getUserProfile } from '../api/API';
import Navbar from './Navbar';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const all = await getEvents();
        const now = new Date();
        const upcoming = all.filter((e) => new Date(e.event_date) >= now);
        upcoming.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        setEvents(upcoming);
      } catch (err) {
        console.error('Error loading upcoming events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)' }}
    >
      <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />

      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-500 p-3 rounded-xl">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Upcoming Events</h1>
              <p className="text-gray-400 mt-1">What’s next on the calendar</p>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-300">Loading events...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : events.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <p className="text-gray-300 text-center">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const date = new Date(event.event_date);
                return (
                  <div
                    key={event.id}
                    className="p-4 sm:p-5 bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        <p className="text-gray-300 text-sm">
                          {date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-600/40 text-blue-100 border border-blue-400/40">
                        Stage {event.stage || '1'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
