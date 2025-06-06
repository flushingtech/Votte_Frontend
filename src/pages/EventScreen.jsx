import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvents, getEventStage, checkAdminStatus } from '../api/API';
import Navbar from '../components/Navbar';
import IdeaSubmission from '../components/IdeaSubmission';
import Stage_1_Ideas from '../components/Stage_1_Ideas';
import Stage_2_Ideas from '../components/Stage_2_Ideas';
import Stage_2_2_Ideas from '../components/Stage_2-2_Ideas';
import Stage_2_3_Ideas from '../components/Stage_2-3_Ideas';
import Stage_3_Ideas from '../components/Stage_3_Ideas';
import ButtonUploadEvent from '../components/ButtonUploadEvent';

function EventScreen() {
  const { eventId } = useParams();
  const email = localStorage.getItem('userEmail');
  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState(null);
  const [eventStage, setEventStage] = useState(1);
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
        setEventStage(stageData.stage);
        setSubStage(stageData.current_sub_stage || '1');

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
              }

              .submissions-open {
                color: #00bfff;
                background-color: #2A2F3C;
                padding: 8px 12px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                box-shadow: 0 0 5px white, 0 0 5px white, 0 0 10px white;
                border-radius: 5px;
              }

              .votte-time {
                color: #28A745;
                background-color: #2A2F3C;
                padding: 8px 20px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                box-shadow: 0 0 5px #28A745, 0 0 5px #28A745, 0 0 10px #28A745;
                border-radius: 5px;
              }

              .our-winners {
                color: #FFA500;
                background-color: #2A2F3C;
                padding: 8px 12px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                box-shadow: 0 0 5px #FFA500, 0 0 5px #FFA500, 0 0 10px #FFA500;
                border-radius: 5px;
              }

              .add-idea-button-container {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
              }

              .event-upload-wrapper {
                transform: scale(0.85);
                align-self: flex-start;
              }
            `}
          </style>

          <div className="max-w-3xl mx-auto p-4 border border-white shadow-md" style={{ backgroundColor: '#1E2A3A', position: 'relative' }}>
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
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              />
            )}

            <div className="submissions-container">
              {eventStage === 1 && subStage === '1' && (
                <>
                  <p className="submissions-open">Submissions Open</p>
                  <div className="add-idea-button-container">
                    {isAdmin && (
                      <div className="event-upload-wrapper">
                        <ButtonUploadEvent eventId={eventId} />
                      </div>
                    )}
                    <IdeaSubmission email={email} eventId={eventId} refreshIdeas={refreshIdeas} />
                  </div>
                </>
              )}

              {eventStage === 1 && subStage === '2' && (
                <>
                  <p className="submissions-open locked">🔒 Submissions Locked</p>
                  {isAdmin && (
                    <div className="event-upload-wrapper">
                      <ButtonUploadEvent eventId={eventId} />
                    </div>
                  )}
                </>
              )}

              {eventStage === 2 && (
                <>
                  <p className="votte-time">Votte Time</p>
                  {isAdmin && (
                    <div className="event-upload-wrapper">
                      <ButtonUploadEvent eventId={eventId} />
                    </div>
                  )}
                </>
              )}

              {eventStage === 3 && (
                <>
                  <p className="our-winners">Our Winners!</p>
                  {isAdmin && (
                    <div className="event-upload-wrapper">
                      <ButtonUploadEvent eventId={eventId} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-3 mb-8">
            {eventStage === 1 ? (
              <Stage_1_Ideas key={ideasRefreshKey} eventId={eventId} refreshIdeas={refreshIdeas} />
            ) : eventStage === 2 && subStage === '1' ? (
              <Stage_2_Ideas key={ideasRefreshKey} eventId={eventId} />
            ) : eventStage === 2 && subStage === '2' ? (
              <Stage_2_2_Ideas key={ideasRefreshKey} eventId={eventId} />
            ) : eventStage === 2 && subStage === '3' ? (
              <Stage_2_3_Ideas key={ideasRefreshKey} eventId={eventId} />
            ) : (
              <Stage_3_Ideas key={ideasRefreshKey} eventId={eventId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventScreen;
