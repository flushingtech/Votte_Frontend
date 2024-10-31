import { useState } from 'react';
import axios from 'axios';

const AddEvent = ({ userEmail }) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/events/add-event', {
        email: userEmail,
        title,
        eventDate,
      });
      setMessage(`🎉 Event "${response.data.title}" added successfully!`);
      setTitle('');
      setEventDate('');
    } catch (error) {
      console.error('Error adding event:', error);
      setMessage('⚠️ Failed to add event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full text-left">
      <h2 className="text-4xl font-bold mb-6">
        Admin: <span style={{ color: '#FF6B35' }}>Add New Event</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Event Title</label>
          <input
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-2 rounded bg-[#2E3B4E] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="px-4 py-2 rounded bg-[#2E3B4E] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 text-lg font-semibold text-white bg-[#FF6B35] rounded hover:bg-[#ff773f] transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Adding Event...' : '📅 Add Event'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-lg font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default AddEvent;
