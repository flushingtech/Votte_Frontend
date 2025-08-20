import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvents, getEventStage, checkAdminStatus } from '../api/API';
import Navbar from '../components/Navbar';
import IdeaSubmission from '../components/IdeaSubmission';
import Stage_1_Ideas from '../components/Stage_1_Ideas';
import Stage_2 from '../components/Stage_2';
import Stage_3_Ideas from '../components/Stage_3_Ideas';
import ButtonUploadEvent from '../components/ButtonUploadEvent';

function EventScreen() {
  const { eventId } = useParams();
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

  // ===== Participants (from event.checked_in) =====
  const participants = useMemo(() => {
    const raw = (event?.checked_in || '')
      .replace(/{}/g, '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    return Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b));
  }, [event]);

  const getInitials = (emailStr) => {
    const prefix = (emailStr || '').split('@')[0] || '';
    if (!prefix) return '•';
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    const first = parts[0]?.[0] || prefix[0];
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  };

  // Flattened, full-height participants panel
  const ParticipantsPanel = () => (
    <aside
      className="border border-white/40 shadow-lg p-4 w-64 h-full flex flex-col rounded-none"
      style={{ backgroundColor: '#1E2A3A' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-lg font-bold">Participants</h2>
        <span
          className="px-2 py-1 text-xs font-semibold"
          style={{
            color: '#28A745',
            backgroundColor: '#2A2F3C',
            boxShadow: '0 0 5px #28A745, 0 0 10px #28A745',
          }}
        >
          {participants.length}
        </span>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 text-sm">No one has checked in yet.</p>
      ) : (
        <ul className="participants-scroll space-y-2 flex-1 overflow-auto pr-1">
          {participants.map((p) => {
            const isYou = p.toLowerCase() === (email || '').toLowerCase();
            return (
              <li
                key={p}
                className="flex items-center justify-between gap-3 px-3 py-2"
                style={{ backgroundColor: '#2A2F3C' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center w-8 h-8 text-sm font-bold shrink-0"
                    style={{
                      backgroundColor: '#0F1724',
                      color: 'white',
                      boxShadow: '0 0 6px rgba(255,255,255,0.15)',
                    }}
                    title={p}
                  >
                    {getInitials(p)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{p}</p>
                    {isYou && (
                      <span
                        className="text-[11px] font-semibold px-1.5 py-0.5"
                        style={{
                          color: '#00bfff',
                          backgroundColor: '#182030',
                          boxShadow: '0 0 5px #fff, 0 0 5px #fff',
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                </div>
                {isYou && (
                  <span
                    className="text-xs font-bold px-2 py-1"
                    style={{
                      color: '#28a745',
                      backgroundColor: '#263044',
                      boxShadow: '0 0 5px #28a745, 0 0 10px #28a745',
                    }}
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
      <div style={{ backgroundColor: '#030C18', height: '100vh', overflow: 'hidden' }}>
        <Navbar userName={email} backToHome={true} />
        <p className="text-center mt-10 text-white">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#030C18', height: '100vh', overflow: 'hidden' }}>
        <Navbar userName={email} backToHome={true} />
        <p className="text-center mt-10 text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#030C18', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Navbar */}
      <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <Navbar userName={email} backToHome={true} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: '60px' }}>
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
          <div className="relative max-w-3xl mx-auto">
            {/* Event Header Card */}
            <div
              className="p-4 border border-white shadow-md"
              style={{ backgroundColor: '#1E2A3A', position: 'relative' }}
            >
              <h1 className="event-title">{event?.title}</h1>
              <p className="text-lg font-bold text-left text-gray-400 mb-2">
                {new Date(event?.event_date).toLocaleDateString()}
              </p>

              {event?.image_url && (
                <img
                  src={event.image_url}
                  alt="Event Banner"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    marginBottom: '1rem',
                  }}
                />
              )}

              <div className="submissions-container">
                <div className="submission-left">
                  {eventStage === '1' && subStage === '1' && (
                    <p className="submissions-open">Submissions Open</p>
                  )}
                  {eventStage === '1' && subStage === '2' && (
                    <p className="submissions-open locked">🔒 Submissions Locked</p>
                  )}
                  {eventStage === '2' && <p className="votte-time">Votte Time</p>}
                  {eventStage === '3' && <p className="our-winners">Our Winners!</p>}

                  {(event?.checked_in || '')
                    .split(',')
                    .map((e) => e.trim())
                    .includes(email) && <span className="checked-in-badge">✅ CHECKED IN</span>}
                </div>

                <div className="add-idea-button-container">
                  {isAdmin && (
                    <div className="event-upload-wrapper">
                      <ButtonUploadEvent eventId={eventId} />
                    </div>
                  )}
                  {eventStage === '1' && subStage === '1' && (
                    <IdeaSubmission email={email} eventId={eventId} refreshIdeas={refreshIdeas} />
                  )}
                </div>
              </div>
            </div>

            {/* ===== Ideas + permanently LEFT-HANGING Participants (same height) ===== */}
            <div className="mt-3 mb-8 relative">
              {/* LEFT hanging panel (desktop) – full height of the ideas wrapper */}
              <div className="hidden md:block absolute right-full top-0 mr-3 z-20 h-full">
                <div className="w-64 h-full">
                  <ParticipantsPanel />
                </div>
              </div>

              {/* Ideas column (centered; same width as header) */}
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

              {/* Mobile: participants stacked below */}
              <div className="md:hidden mt-3">
                <ParticipantsPanel />
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
