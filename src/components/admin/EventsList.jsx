import { useEffect, useState } from 'react';
import { getEvents, deleteEvent, getIdeasForEvent, syncMeetupEvents } from '../../api/API';

const EventsList = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [ideasCounts, setIdeasCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedView, setSelectedView] = useState('upcoming'); // 'upcoming' or 'past'
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

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
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteEvent(deleteConfirm);
      setEvents(events.filter((event) => event.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setDeleteConfirm(null);
    }
  };

  const handleSync = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email || '';

    if (!userEmail) {
      setSyncMessage({ type: 'error', text: 'User email not found' });
      return;
    }

    setSyncing(true);
    setSyncMessage(null);

    try {
      await syncMeetupEvents(userEmail);
      setSyncMessage({ type: 'success', text: 'Events synced successfully!' });

      // Refresh events list
      const eventsData = await getEvents();
      setEvents(eventsData);

      // Refresh idea counts
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

      // Clear success message after 3 seconds
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      console.error('Error syncing events:', err);
      setSyncMessage({ type: 'error', text: 'Failed to sync events' });
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => new Date(event.event_date) >= today);
  const pastEvents = events
    .filter(event => new Date(event.event_date) < today)
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date)); // Most recent first

  const EventCard = ({ event }) => (
    <li
      key={event.id}
      className="bg-gradient-to-br from-slate-700/30 to-slate-800/20 backdrop-blur-sm rounded-xl border border-slate-600/50 p-4 hover:border-slate-500/60 transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2 leading-tight">
            {event.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-lg text-xs font-semibold border border-purple-500/50">
              📅 {new Date(event.event_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="bg-blue-600/30 text-blue-200 px-3 py-1 rounded-lg text-xs font-semibold border border-blue-500/50">
              💡 {ideasCounts[event.id] || 0} Ideas
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEventSelect(event)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            👁️ View
          </button>
          <button
            onClick={() => handleDelete(event.id)}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🗑️
          </button>
        </div>
      </div>
    </li>
  );

  const displayedEvents = selectedView === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-white">📅 Events</h2>
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/50 text-blue-200 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/50">
            {events.length} Total
          </span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              syncing
                ? 'bg-slate-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 shadow-lg hover:shadow-xl'
            }`}
            title="Sync events from Meetup"
          >
            {syncing ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                Syncing...
              </>
            ) : (
              <>
                🔄 Sync
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-semibold ${
          syncMessage.type === 'success'
            ? 'bg-green-600/20 text-green-200 border border-green-500/50'
            : 'bg-red-600/20 text-red-200 border border-red-500/50'
        }`}>
          {syncMessage.text}
        </div>
      )}

      {/* Tab Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setSelectedView('upcoming')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedView === 'upcoming'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-slate-700/30 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>🔜 Upcoming</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              selectedView === 'upcoming'
                ? 'bg-white/20'
                : 'bg-slate-600/50'
            }`}>
              {upcomingEvents.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setSelectedView('past')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedView === 'past'
              ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg'
              : 'bg-slate-700/30 text-gray-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>📜 Past</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              selectedView === 'past'
                ? 'bg-white/20'
                : 'bg-slate-600/50'
            }`}>
              {pastEvents.length}
            </span>
          </div>
        </button>
      </div>

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-6xl mb-4">{selectedView === 'upcoming' ? '📭' : '🗂️'}</div>
          <p className="text-gray-400 text-lg">
            {selectedView === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-auto pr-2">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setDeleteConfirm(null)}
          ></div>
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 max-w-md w-full animate-slide-down">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-3">Delete Event?</h2>
                <p className="text-gray-300 text-base">
                  Are you sure you want to delete this event? This action cannot be undone and will delete all associated ideas.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-white px-4 py-3 rounded-lg font-semibold hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-200 border border-slate-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg"
                  style={{
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventsList;
