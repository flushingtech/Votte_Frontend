import { useState } from 'react';
import { addEvent } from '../../api/API';

const AddEvent = ({ userEmail, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEvent(userEmail, title, eventDate);
      onSuccess(); // Call the onSuccess callback to close the modal and refresh the admin page
      setTitle('');
      setEventDate('');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('⚠️ Failed to add event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-300 bg-[#1E2A3A] text-white space-y-6 w-full flex flex-col justify-center"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Event Title:</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 shadow-sm bg-[#2E3B4E] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Event Date:</label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 shadow-sm bg-[#2E3B4E] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 focus:outline-none"
        disabled={loading}
      >
        {loading ? 'Adding Event...' : '📅 Add Event'}
      </button>
    </form>
  );
};

export default AddEvent;
