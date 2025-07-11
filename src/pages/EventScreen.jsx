import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getEvents,
  getEventStage,
  checkAdminStatus
} from '../api/API';
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
        const eventDetails = events.find(evt => evt.id === parseInt(eventId, 10));
        if (!eventDetails) throw new Error('Event not found');
        setEvent(eventDetails);

        const stageData = await getEventStage(eventId);
        console.log('✅ Raw stageData from backend:', stageData);

        let rawStage = stageData?.stage;
        let rawSubStage = stageData?.current_sub_stage;

        console.log('🧪 BEFORE conversion – rawStage:', rawStage, 'typeof:', typeof rawStage);
        console.log('🧪 BEFORE conversion – rawSubStage:', rawSubStage, 'typeof:', typeof rawSubStage);

        rawStage = rawStage?.toString();
        rawSubStage = rawSubStage?.toString();

        console.log('🎯 AFTER conversion – eventStage:', rawStage, 'subStage:', rawSubStage);

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

  const refreshIdeas = () => setIdeasRefreshKey(prevKey => prevKey + 1);

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

  console.log('🔥 Final render stage:', eventStage, 'subStage:', subStage);

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
                flex-wrap: wrap;
                gap: 10px;
              }

              .submission-left {
                display: flex;
                align-items: center;
                gap: 10px;
              }

              .checked-in-badge {
                color: #28a745;
                background-color: #2A2F3C;
                padding: 8px 12px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 5px;
                box-shadow: 0 0 5px #28a745, 0 0 10px #28a745;
                display: flex;
                align-items: center;
                gap: 6px;
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
              <div className="submission-left">
                {eventStage === '1' && subStage === '1' && <p className="submissions-open">Submissions Open</p>}
                {eventStage === '1' && subStage === '2' && <p className="submissions-open locked">🔒 Submissions Locked</p>}
                {eventStage === '2' && <p className="votte-time">Votte Time</p>}
                {eventStage === '3' && <p className="our-winners">Our Winners!</p>}

                {(event?.checked_in || '').split(',').includes(email) && (
                  <span className="checked-in-badge">✅ CHECKED IN</span>
                )}
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

          <div className="max-w-3xl mx-auto mt-3 mb-8">
            {eventStage === '1' ? (
              <Stage_1_Ideas
              key={ideasRefreshKey}
              eventId={eventId}
              refreshIdeas={refreshIdeas}
              isAdmin={isAdmin} // ✅ pass this down
            />
            
            ) : eventStage === '2' ? (
              <Stage_2 key={ideasRefreshKey} eventId={eventId} />
            ) : eventStage === '3' ? (
              <Stage_3_Ideas key={ideasRefreshKey} eventId={eventId} />
            ) : (
              <p className="text-white text-center">Unknown event stage: {eventStage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventScreen;
