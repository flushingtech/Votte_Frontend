import { useEffect, useState } from 'react';
import { getEvents, deleteEvent, getIdeasForEvent } from '../../api/API';

const EventsList = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [ideasCounts, setIdeasCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);

        // Fetch idea counts for each event
        const counts = {};
        for (const event of eventsData) {
          try {
            const ideas = await getIdeasForEvent(event.id);
            counts[event.id] = ideas.length;
          } catch (err) {
            console.error(`Error fetching ideas for event ${event.id}:`, err);
          }
        }
        setIdeasCounts(counts);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  if (loading) return <p className="text-gray-400">Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full text-left">
      <h2 className="text-xl font-bold mb-4 text-white">Upcoming Events</h2>
      <ul className="space-y-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex justify-between items-center bg-[#2E3B4E] p-3 rounded shadow"
          >
            <div>
              <h3 className="text-md font-semibold text-white">{event.title}</h3>
              <p className="text-gray-400 text-sm">
                {new Date(event.event_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-300">
                Ideas: {ideasCounts[event.id] || 0}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEventSelect(event)}
                className="px-3 py-1 text-sm bg-white text-black rounded hover:bg-gray-200 transition-all"
              >
                View Ideas
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
