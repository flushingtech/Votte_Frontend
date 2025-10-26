import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvents, getEventStage, checkAdminStatus } from '../api/API';
import Navbar from '../components/Navbar';
import IdeaSubmission from '../components/IdeaSubmission';
import Stage_1_Ideas from '../components/Stage_1_Ideas';
import Stage_2 from '../components/Stage_2';
import Stage_3_Ideas from '../components/Stage_3_Ideas';
import ButtonUploadEvent from '../components/ButtonUploadEvent';

function EventScreen() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');

  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState(null);
  const [eventStage, setEventStage] = useState('1');
  const [subStage, setSubStage] = useState('1');
  const [ideasRefreshKey, setIdeasRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const events = await getEvents();
        const eventDetails = events.find((evt) => evt.id === parseInt(eventId, 10));
        if (!eventDetails) throw new Error('Event not found');
        setEvent(eventDetails);

        const stageData = await getEventStage(eventId);
        const rawStage = stageData?.stage?.toString?.();
        const rawSubStage = stageData?.current_sub_stage?.toString?.();

        setEventStage(rawStage || '1');
        setSubStage(rawSubStage || '1');

        const isAdminStatus = await checkAdminStatus(email);
        setIsAdmin(isAdminStatus);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, email]);

  const refreshIdeas = () => setIdeasRefreshKey((prevKey) => prevKey + 1);

  const usernameOnly = (s = '') => s.split('@')[0] || '';

  // ===== Participants (from event.checked_in) — display usernames only =====
  const participants = useMemo(() => {
    const raw = (event?.checked_in || '')
      .replace(/{}/g, '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    // unique by full email (source of truth), but sort by username
    const unique = Array.from(new Set(raw));
    unique.sort((a, b) => usernameOnly(a).localeCompare(usernameOnly(b)));
    return unique;
  }, [event]);

  const getInitials = (emailStr) => {
    const prefix = usernameOnly(emailStr);
    if (!prefix) return '•';
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    const first = parts[0]?.[0] || prefix[0];
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  };

  // Modern participants panel
  const ParticipantsPanel = () => (
    <aside className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl border border-purple-700/50 shadow-2xl p-4 w-full max-h-96 lg:max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-lg font-bold">Participants</h2>
        <span className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/50">
          {participants.length}
        </span>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 text-sm">No one has checked in yet.</p>
      ) : (
        <ul className="participants-scroll space-y-2 flex-1 overflow-auto pr-1">
          {participants.map((p) => {
            const uname = usernameOnly(p);
            const isYou = p.toLowerCase() === (email || '').toLowerCase();
            return (
              <li
                key={p}
                className="flex items-center justify-between gap-3 px-3 py-3 bg-purple-800/20 rounded-lg border border-purple-700/30 hover:bg-purple-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 text-sm font-bold shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white shadow-lg">
                    {getInitials(p)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{uname}</p>
                    {isYou && (
                      <span className="bg-blue-600/50 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/50">
                        You
                      </span>
                    )}
                  </div>
                </div>
                {isYou && (
                  <span
                    className="bg-green-600/50 text-green-200 text-xs font-bold px-2 py-1 rounded-lg border border-green-500/50"
                    title="Checked in"
                  >
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );

  if (loading) {
    return (
      <div 
        className="min-h-screen text-white"
        style={{ 
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
          minHeight: '100vh' 
        }}
      >
        <Navbar userName={email} backToHome={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen text-white"
        style={{ 
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
          minHeight: '100vh' 
        }}
      >
        <Navbar userName={email} backToHome={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
        minHeight: '100vh' 
      }}
    >
      {/* Fixed Navbar */}
      <Navbar userName={email} backToHome={true} />

      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="p-3">
          <style>
            {`
              .event-title {
                position: relative;
                display: inline-block;
                text-align: center;
                font-size: 2.5rem;
                font-weight: bold;
                color: white;
              }
              .submissions-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
              }
              .submission-left { display: flex; align-items: center; gap: 10px; }
              .checked-in-badge {
                color: #28a745; background-color: #2A2F3C; padding: 8px 12px; font-size: 14px;
                font-weight: bold; box-shadow: 0 0 5px #28a745, 0 0 10px #28a745;
                display: flex; align-items: center; gap: 6px;
              }
              .submissions-open {
                color: #00bfff; background-color: #2A2F3C; padding: 8px 12px; font-size: 14px; font-weight: bold;
                text-transform: uppercase; box-shadow: 0 0 5px white, 0 0 5px white, 0 0 10px white;
              }
              .votte-time { color: #28A745; background-color: #2A2F3C; padding: 8px 20px; font-size: 14px; font-weight: bold;
                text-transform: uppercase; box-shadow: 0 0 5px #28A745, 0 0 5px #28A745, 0 0 10px #28A745; }
              .our-winners { color: #FFA500; background-color: #2A2F3C; padding: 8px 12px; font-size: 14px; font-weight: bold;
                text-transform: uppercase; box-shadow: 0 0 5px #FFA500, 0 0 5px #FFA500, 0 0 10px #FFA500; }
              .add-idea-button-container { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
              .event-upload-wrapper { transform: scale(0.85); align-self: flex-start; }

              /* Subtle, dark-friendly scrollbar for Participants list */
              .participants-scroll {
                scrollbar-width: thin; /* Firefox */
                scrollbar-color: rgba(255,255,255,0.18) transparent;
              }
              .participants-scroll::-webkit-scrollbar { width: 8px; }
              .participants-scroll::-webkit-scrollbar-track { background: transparent; }
              .participants-scroll::-webkit-scrollbar-thumb {
                background-color: rgba(255,255,255,0.14);
                border-radius: 6px;
                border: 2px solid transparent;
                background-clip: padding-box;
                transition: background-color 120ms ease-in-out;
              }
              .participants-scroll:hover::-webkit-scrollbar-thumb {
                background-color: rgba(255,255,255,0.26);
              }
            `}
          </style>

          {/* ===== Main centered column (header + ideas) — same width ===== */}
          <div className="relative max-w-5xl mx-auto">
            {/* Event Header Card with Back Button */}
            <div className="relative mb-6">
              <button
                onClick={() => navigate(-1)}
                className="absolute -left-12 top-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                title="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-2xl p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-left mb-4">
                  {event?.title}
                </h1>
              <p className="text-lg text-gray-300 text-left mb-6">
                {new Date(event?.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>

              {event?.image_url && (
                <div className="mb-6">
                  <img
                    src={event.image_url}
                    alt="Event Banner"
                    className="w-full h-48 sm:h-56 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {eventStage === '1' && subStage === '1' && (
                    <span className="bg-blue-600/50 text-blue-200 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-500/50">
                      📝 Submissions Open
                    </span>
                  )}
                  {eventStage === '1' && subStage === '2' && (
                    <span className="bg-orange-600/50 text-orange-200 px-4 py-2 rounded-lg font-semibold text-sm border border-orange-500/50">
                      🔒 Submissions Locked
                    </span>
                  )}
                  {eventStage === '2' && (
                    <span className="bg-green-600/50 text-green-200 px-4 py-2 rounded-lg font-semibold text-sm border border-green-500/50">
                      🗳️ Voting Time
                    </span>
                  )}
                  {eventStage === '3' && (
                    <span className="bg-yellow-600/50 text-yellow-200 px-4 py-2 rounded-lg font-semibold text-sm border border-yellow-500/50">
                      🏆 Our Winners!
                    </span>
                  )}

                  {(event?.checked_in || '')
                    .split(',')
                    .map((e) => e.trim())
                    .includes(email) && (
                    <span className="bg-emerald-600/50 text-emerald-200 px-4 py-2 rounded-lg font-semibold text-sm border border-emerald-500/50">
                      ✅ Checked In
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {isAdmin && (
                    <div className="transform scale-90">
                      <ButtonUploadEvent eventId={eventId} />
                    </div>
                  )}
                  {eventStage === '1' && subStage === '1' && (
                    <IdeaSubmission email={email} eventId={eventId} refreshIdeas={refreshIdeas} />
                  )}
                </div>
              </div>
              </div>
            </div>

            {/* ===== Ideas + Participants Layout ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Ideas column - takes 3 columns on large screens */}
              <div className="lg:col-span-3">
                {eventStage === '1' ? (
                  <Stage_1_Ideas
                    key={ideasRefreshKey}
                    eventId={eventId}
                    refreshIdeas={refreshIdeas}
                    isAdmin={isAdmin}
                  />
                ) : eventStage === '2' ? (
                  <Stage_2 key={ideasRefreshKey} eventId={eventId} />
                ) : eventStage === '3' ? (
                  <Stage_3_Ideas key={ideasRefreshKey} eventId={eventId} />
                ) : (
                  <p className="text-white text-center">Unknown event stage: {eventStage}</p>
                )}
              </div>

              {/* Participants panel - takes 1 column on large screens, full width on smaller */}
              <div className="lg:col-span-1">
                <div className="sticky top-6" style={{ zIndex: 10 }}>
                  <ParticipantsPanel />
                </div>
              </div>
            </div>
            {/* ===== /Ideas + permanently LEFT-HANGING Participants ===== */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventScreen;
