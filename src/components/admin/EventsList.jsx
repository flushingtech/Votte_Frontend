import { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '../../api/API';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
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

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full text-left">
      <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex justify-between items-center bg-[#2E3B4E] p-3 rounded">
            <div>
              <h3 className="text-md font-semibold">{event.title}</h3>
              <p className="text-gray-400 text-sm">{new Date(event.event_date).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => handleDelete(event.id)}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
