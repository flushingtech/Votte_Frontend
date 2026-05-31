import { useEffect, useState } from 'react';
import { getEvents, deleteEvent, getIdeasForEvent, syncMeetupEvents, updateEventDate } from '../../api/API';

const EventsList = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [ideasCounts, setIdeasCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [selectedView, setSelectedView] = useState('upcoming');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);

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

  const handleEditClick = (e, event) => {
    e.stopPropagation();
    // Format date as YYYY-MM-DD for the date input
    const d = new Date(event.event_date);
    const formatted = d.toISOString().split('T')[0];
    setEditDate(formatted);
    setEditingEvent(event);
    setEditMessage(null);
  };

  const handleSaveDate = async () => {
    if (!editDate || !editingEvent) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email || localStorage.getItem('userEmail') || '';
    setEditSaving(true);
    try {
      await updateEventDate(editingEvent.id, editDate, userEmail);
      setEvents(prev => prev.map(ev =>
        ev.id === editingEvent.id ? { ...ev, event_date: editDate } : ev
      ));
      setEditMessage({ type: 'success', text: 'Date updated!' });
      setTimeout(() => { setEditingEvent(null); setEditMessage(null); }, 1200);
    } catch (err) {
      console.error('Error updating event date:', err);
      setEditMessage({ type: 'error', text: 'Failed to update date' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
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

      const eventsData = await getEvents();
      setEvents(eventsData);

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

      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      console.error('Error syncing events:', err);
      setSyncMessage({ type: 'error', text: 'Failed to sync events' });
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
        <p className="text-gray-400">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= today)
    .filter(event => event.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const pastEvents = events
    .filter(event => new Date(event.event_date) < today)
    .filter(event => event.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  const displayedEvents = selectedView === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('upcoming')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1.5 ${
              selectedView === 'upcoming'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
            }`}
          >
            <span>🔜</span>
            <span>Upcoming ({events.filter(e => new Date(e.event_date) >= today).length})</span>
          </button>
          <button
            onClick={() => setSelectedView('past')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1.5 ${
              selectedView === 'past'
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
            }`}
          >
            <span>📜</span>
            <span>Past ({events.filter(e => new Date(e.event_date) < today).length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full px-4 py-2 pl-10 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1.5 ${
            syncing
              ? 'bg-slate-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 shadow-lg'
          }`}
        >
          {syncing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Sync Meetup</span>
            </>
          )}
        </button>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          syncMessage.type === 'success'
            ? 'bg-green-900/20 text-green-300 border border-green-500/50'
            : 'bg-red-900/20 text-red-300 border border-red-500/50'
        }`}>
          {syncMessage.text}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{displayedEvents.length}</span> {selectedView} event{displayedEvents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
            <span className="text-4xl">{selectedView === 'upcoming' ? '📭' : '🗂️'}</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {selectedView === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term.' : selectedView === 'upcoming' ? 'Sync from Meetup to add events.' : 'Past events will appear here.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-700/50">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventSelect(event)}
              className="p-4 cursor-pointer transition-all duration-200 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-4">
                {/* Date badge */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${
                  new Date(event.event_date) >= today
                    ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50'
                    : 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-slate-600/50'
                }`}>
                  <span className="text-xs font-bold text-gray-300 uppercase">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold truncate">{event.title}</span>
                    {new Date(event.event_date) >= today && (
                      <span className="bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Upcoming
                      </span>
                    )}
                    {event.event_type === 'live_coding' ? (
                      <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full text-xs font-semibold">
                        💻 Live Coding
                      </span>
                    ) : (
                      <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full text-xs font-semibold">
                        🏆 Hackathon
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="text-gray-400">{formatDate(event.event_date)}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-purple-400 flex items-center gap-1">
                      <span>💡</span> {ideasCounts[event.id] || 0} ideas
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(event);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-1.5 text-sm"
                  >
                    <span>👁️</span>
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    onClick={(e) => handleEditClick(e, event)}
                    className="bg-slate-700/50 hover:bg-blue-600/80 border border-slate-600/50 hover:border-blue-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-sm"
                  >
                    <span>✏️</span>
                    <span className="hidden sm:inline">Edit Date</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, event.id)}
                    className="bg-slate-700/50 hover:bg-red-600/80 border border-slate-600/50 hover:border-red-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-sm"
                  >
                    <span>🗑️</span>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Date Modal */}
      {editingEvent && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={() => setEditingEvent(null)} />
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-1">Edit Event Date</h2>
              <p className="text-gray-400 text-sm mb-6 truncate">{editingEvent.title}</p>

              {editMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                  editMessage.type === 'success'
                    ? 'bg-green-900/20 text-green-300 border border-green-500/50'
                    : 'bg-red-900/20 text-red-300 border border-red-500/50'
                }`}>
                  {editMessage.text}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">New Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDate}
                  disabled={editSaving || !editDate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg"
                >
                  {editSaving ? 'Saving...' : '💾 Save Date'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setDeleteConfirm(null)}
          ></div>
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Delete Event?</h2>
                <p className="text-gray-300 text-base">
                  Are you sure you want to delete this event? This action cannot be undone and will delete all associated ideas.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg"
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
