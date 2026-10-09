import { useState } from 'react';
import { addEvent } from '../../api/API';

const AddEvent = ({ userEmail, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('hackathon');
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
      await addEvent(userEmail, title, eventDate, eventType);
      showNotification('Event added successfully!', 'success');
      onSuccess();
      setTitle('');
      setEventDate('');
      setEventType('hackathon');
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Failed to add event. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 flex-shrink-0 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-xs shadow shadow-emerald-500/30">✨</span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">Create Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Event Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
              placeholder="e.g., Spring Hackathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Event Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 text-white focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark] text-sm"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Event Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEventType('hackathon')}
                className={`flex-1 py-2 px-3 text-xs font-semibold border transition-colors ${
                  eventType === 'hackathon'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                🏆 Hackathon
              </button>
              <button
                type="button"
                onClick={() => setEventType('live_coding')}
                className={`flex-1 py-2 px-3 text-xs font-semibold border transition-colors ${
                  eventType === 'live_coding'
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                💻 Live Coding
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            className={`px-4 py-3 border shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-emerald-600/90 border-emerald-500/50 text-emerald-50'
                : 'bg-red-600/90 border-red-500/50 text-red-50'
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
