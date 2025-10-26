import { useState } from 'react';
import { addEvent } from '../../api/API';

const AddEvent = ({ userEmail, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEvent(userEmail, title, eventDate);
      showNotification('✅ Event added successfully!', 'success');
      onSuccess();
      setTitle('');
      setEventDate('');
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('⚠️ Failed to add event. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-white">➕ Create Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              📝 Event Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., Spring Hackathon 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              📅 Event Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all [color-scheme:dark]"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Event...
            </span>
          ) : (
            '🚀 Create Event'
          )}
        </button>
      </form>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
          <div
            className={`px-6 py-4 rounded-xl border shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-br from-green-600/90 to-emerald-600/90 border-green-500/50 text-green-50'
                : 'bg-gradient-to-br from-red-600/90 to-rose-600/90 border-red-500/50 text-red-50'
            }`}
            style={{
              boxShadow:
                notification.type === 'success'
                  ? '0 0 30px rgba(16, 185, 129, 0.4)'
                  : '0 0 30px rgba(239, 68, 68, 0.4)',
            }}
          >
            <p className="text-sm font-semibold whitespace-nowrap">
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
