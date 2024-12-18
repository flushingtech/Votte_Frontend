import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvents, getEventStage } from '../api/API';
import Navbar from '../components/Navbar';
import IdeaSubmission from '../components/IdeaSubmission';
import Stage_1_Ideas from '../components/Stage_1_Ideas';
import Stage_2_Ideas from '../components/Stage_2_Ideas';
import Stage_3_Ideas from '../components/Stage_3_Ideas';

function EventScreen() {
  const { eventId } = useParams();
  const email = localStorage.getItem('userEmail');
  const [event, setEvent] = useState(null);
  const [eventStage, setEventStage] = useState(1); // Track the stage of the event
  const [ideasRefreshKey, setIdeasRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  useEffect(() => {
    if (!email) {
      setError('Email not provided.');
      setLoading(false);
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const events = await getEvents();
        const eventDetails = events.find((evt) => evt.id === parseInt(eventId, 10));
        if (!eventDetails) throw new Error('Event not found');
        setEvent(eventDetails);

        // Fetch the event stage
        const stageData = await getEventStage(eventId);
        setEventStage(stageData.stage);

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

  if (loading)
    return (
      <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
        <Navbar userName={email} backToHome={true} />
        <p className="text-center mt-10">Loading event details...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
        <Navbar userName={email} backToHome={true} />
        <p className="text-center mt-10">{error}</p>
      </div>
    );

  return (
    <div style={{ backgroundColor: '#030C18', height: '100vh', overflow: 'hidden' }}>
      <Navbar userName={email} backToHome={true} />
      <div className="p-3">
        {/* Event Information */}
        <div className="max-w-3xl mx-auto p-4 border border-white shadow-md"
          style={{ backgroundColor: '#1E2A3A' }}>
          {/* Event Title */}
          <h1 className="text-4xl font-extrabold text-center mb-1"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffdd00, #ffa500)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}>
            {event?.title}
          </h1>

          {/* Event Date */}
          <p className="text-lg text-center text-gray-400 mb-2">
            {new Date(event?.event_date).toLocaleDateString()}
          </p>

          {/* Stage-Specific Message */}
          {eventStage === 3 ? (
            <p className="text-center text-yellow-400 text-sm font-semibold uppercase tracking-wide px-2 py-1"
              style={{ backgroundColor: '#2A2F3C', display: 'inline-block', margin: '0 auto' }}>
              Results
            </p>
          ) : eventStage === 2 ? (
            <p className="text-center text-green-400 text-sm font-semibold uppercase tracking-wide px-2 py-1"
              style={{ backgroundColor: '#2A2F3C', display: 'inline-block', margin: '0 auto' }}>
              Votte Time - Submissions are closed.
            </p>
          ) : (
            <p className="text-center text-blue-400 text-sm font-semibold uppercase tracking-wide px-2 py-1"
              style={{ backgroundColor: '#2A2F3C', display: 'inline-block', margin: '0 auto' }}>
              Submissions Open
            </p>
          )}
        </div>


        {/* Conditionally Render Ideas */}
        <div className="max-w-3xl mx-auto mt-3">
          {eventStage === 1 ? (
            <Stage_1_Ideas key={ideasRefreshKey} eventId={eventId} refreshIdeas={refreshIdeas} />
          ) : eventStage === 2 ? (
            <Stage_2_Ideas key={ideasRefreshKey} eventId={eventId} />
          ) : (
            <Stage_3_Ideas key={ideasRefreshKey} eventId={eventId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default EventScreen;
