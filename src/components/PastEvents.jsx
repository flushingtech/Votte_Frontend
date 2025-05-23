import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/API';
import Navbar from './Navbar';

function PastEvents() {
  const [events, setEvents] = useState([]);
  const [dateEvents, setDateEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const all = await getEvents();
        const past = all.filter(e => new Date(e.event_date) < new Date());

        const map = {};
        past.forEach(event => {
          const date = new Date(event.event_date).toDateString();
          if (!map[date]) map[date] = [];
          map[date].push(event);
        });

        setEvents(past);
        setDateEvents(map);
      } catch (err) {
        console.error('Error loading past events:', err);
      }
    };

    fetchPastEvents();
  }, []);

  const tileClassName = ({ date }) => {
    const key = date.toDateString();
    return dateEvents[key] ? 'highlighted-date' : null;
  };

  const handleDateClick = (value) => {
    const key = value.toDateString();
    setSelectedDate(dateEvents[key] || []);
  };

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: 'white' }}>
      <Navbar />
      <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">Past Events Calendar</h2>

        <div className="w-full max-w-md">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            className="rounded-lg shadow-lg p-3 bg-white text-black w-full"
          />

          <style>
            {`
              .react-calendar__tile {
                color: black !important;
              }

              .highlighted-date {
                background: #facc15 !important;
                color: black !important;
                font-weight: bold;
                border-radius: 50%;
              }

              .react-calendar__month-view__weekdays,
              .react-calendar__navigation button {
                color: black !important;
              }
            `}
          </style>

          {selectedDate && (
            <div className="mt-6 space-y-4">
              {selectedDate.map(event => (
                <div
                  key={event.id}
                  className="p-4 border border-white bg-[#1E2A3A] shadow w-full"
                >
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="text-sm text-gray-300">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Event
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PastEvents;
