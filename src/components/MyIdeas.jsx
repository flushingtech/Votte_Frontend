import { useEffect, useState } from 'react';
import { getUserIdeas } from '../api/API';
import { useNavigate } from 'react-router-dom';

function MyIdeas({ email }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserIdeas = async () => {
      try {
        const userIdeas = await getUserIdeas(email);
        setIdeas(userIdeas);
      } catch (err) {
        console.error('Error fetching user ideas:', err);
        setError('Failed to load your ideas');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUserIdeas();
    }
  }, [email]);

  const handleEventClick = (eventId) => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      console.error('Event ID is undefined for this idea.');
    }
  };

  if (loading) return <p>Loading your ideas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="my-ideas-section bg-transparent relative flex flex-col h-full">
      {/* Sticky Header (Dark Blue) */}
      <div
        className="p-2 border shadow-md"
        style={{
          backgroundColor: '#1E2A3A',
          border: '2px solid white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 className="text-xl font-bold text-white">My Ideas</h2>
      </div>

      {/* Scrollable Ideas List with White Background */}
      <div className="overflow-y-auto" style={{ maxHeight: '30vh', paddingTop: '8px' }}>
        {ideas.length === 0 ? (
          <div
            className="p-3 shadow-md border"
            style={{ backgroundColor: 'white', textAlign: 'left' }}
          >
            <h3 className="text-lg font-bold text-black">You haven’t submitted any ideas yet.</h3>
            <p className="text-gray-700 text-sm mt-2">Click on an event and add your ideas there.</p>
          </div>
        ) : (
          <ul className="space-y-1"> {/* Reduced spacing between ideas */}
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="p-2 shadow-md border relative"
                style={{
                  backgroundColor: 'white', // White Background for Ideas
                  fontSize: '14px',
                  border: '2px solid #1E2A3A', // Dark Blue Border
                  marginBottom: '3px', // Reduce spacing between ideas
                  padding: '6px', // Reduce padding inside each idea box
                }}
              >
                {/* "View Event" Button in the Top-Right Corner */}
                <button
                  className="absolute top-2 right-2 text-xs font-semibold bg-black text-white px-2 py-1 hover:bg-gray-800 transition-all"
                  onClick={() => handleEventClick(idea.event_id)}
                  style={{
                    border: '1px solid #666',
                    borderRadius: '4px',
                  }}
                >
                  View Event
                </button>

                {/* Idea Content */}
                <div>
                  <h3
                    className="text-sm font-bold text-black truncate"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {idea.idea}
                  </h3>
                  <p
                    className="text-gray-700 text-xs truncate mt-1"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {idea.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyIdeas;
