import { useState } from 'react';
import { addEvent } from '../../api/API';

const AddEvent = ({ userEmail, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEvent(userEmail, title, eventDate);
      showNotification('Event added successfully!', 'success');
      onSuccess();
      setTitle('');
      setEventDate('');
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Failed to add event. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Create Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Event Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
              placeholder="e.g., Spring Hackathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Event Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all [color-scheme:dark] text-sm"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </span>
          ) : (
            'Create Event'
          )}
        </button>
      </form>

      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
          <div
            className={`px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-br from-green-600/90 to-emerald-600/90 border-green-500/50 text-green-50'
                : 'bg-gradient-to-br from-red-600/90 to-rose-600/90 border-red-500/50 text-red-50'
            }`}
          >
            <p className="text-sm font-semibold whitespace-nowrap">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
