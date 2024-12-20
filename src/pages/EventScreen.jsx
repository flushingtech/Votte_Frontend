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
        <style>
          {`
            .event-title {
              position: relative;
              display: inline-block;
              padding: px;
              text-align: center;
              font-size: 2.5rem; /* Adjust the font size */
              font-weight: bold; /* Make the font bold */
              color: white;
            }

            .event-title::before {
              content: '';
              position: absolute;
              top: -4px;
              left: -4px;
              right: -4px;
              bottom: -4px;
              z-index: -1;
              border: 2px solid #fff;
              border-radius: 10px;
              box-shadow: 0 0 10px #ffdd00, 0 0 20px #ffa500, 0 0 30px #ffdd00;
            }

            .submissions-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 10px;
            }

            .submissions-open {
              color: #00bfff;
              background-color: #2A2F3C;
              padding: 8px 12px;
              border-radius: 5px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              box-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px white;
              animation: glowing-white 1.5s infinite alternate;
            }

            .add-idea-button {
              padding: 8px 12px;
              font-size: 14px;
              font-weight: bold;
              color: white;
              background-color: #1E90FF;
              border-radius: 3px;
              cursor: pointer;
              text-transform: uppercase;
              animation: pulse 5s infinite;
              transition: background-color 0.3s;
            }

            .add-idea-button:hover {
              background-color: #1C86EE;
            }

            @keyframes glowing-white {
              0% {
                box-shadow: 0 0 3px white, 0 0 2px white, 0 0 3px white;
              }
              100% {
                box-shadow: 0 0 9px white, 0 0 7px white, 0 0 5px white;
              }
            }

            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
          `}
        </style>

        {/* Event Information */}
        <div
          className="max-w-3xl mx-auto p-4 border border-white shadow-md"
          style={{ backgroundColor: '#1E2A3A', position: 'relative' }}
        >
          {/* Event Title */}
          <h1 className="text-4xl font-normal text-center mb-1 event-title">
            {event?.title}
          </h1>

          {/* Event Date */}
          <p className="text-lg font-bold text-left text-gray-400 mb-2">
            {new Date(event?.event_date).toLocaleDateString()}
          </p>

          {/* Submissions Open and Add Idea */}
          <div className="submissions-container">
            <p className="submissions-open">Submissions Open</p>
            <button
              className="add-idea-button"
              onClick={() => {
                // Logic to open the IdeaSubmission modal or navigate to the Idea submission screen
              }}
            >
              Add Idea
            </button>
          </div>
        </div>

        {/* Conditionally Render Ideas */}
        <div className="max-w-3xl mx-auto mt-3">
          {eventStage === 1 ? (
            <Stage_1_Ideas
              key={ideasRefreshKey}
              eventId={eventId}
              refreshIdeas={refreshIdeas}
            />
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
