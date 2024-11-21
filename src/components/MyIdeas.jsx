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
    <div className="my-ideas-section bg-transparent">
      <h2 className="text-xl font-bold mb-2 text-white">My Ideas</h2>
      {ideas.length === 0 ? (
        <div
          className="p-4 shadow-md border"
          style={{ backgroundColor: '#1E2A3A', textAlign: 'left' }}
        >
          <h3 className="text-lg font-bold text-white">You haven’t submitted any ideas yet.</h3>
          <p className="text-gray-400 text-sm mt-2">
            Click on an event and add your ideas there.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="p-3 shadow-md border flex justify-between items-center"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              <div>
                <h3 className="text-lg font-bold text-white">{idea.idea}</h3>
                <p className="text-gray-300 text-xs">{idea.description}</p>
                {/* <p className="text-gray-500 text-xs mt-1">{idea.technologies}</p> */}
                <p className="text-gray-500 text-xs">Likes: {idea.likes}</p>
                {/* <p className="text-gray-500 text-xs">Status: {idea.is_built ? 'Built' : 'Not Built'}</p> */}
              </div>
              {/* Go To Event Button */}
              <div className="text-right">
                <button
                  className="text-sm font-semibold bg-white text-black px-4 py-2 hover:bg-gray-200 transition-all"
                  onClick={() => handleEventClick(idea.event_id)}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                >
                  View Event
                </button>
                <p className="text-gray-400 text-xs mt-1">{idea.event_title}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyIdeas;
