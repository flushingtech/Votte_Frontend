import { useEffect, useState } from 'react';
import { getUserIdeas } from '../api/API';

function MyIdeas({ email }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <li key={idea.id} className="p-3 shadow-md border" style={{ backgroundColor: '#1E2A3A' }}>
              <h3 className="text-lg font-bold text-white">{idea.idea}</h3>
              <p className="text-gray-400 text-sm">Event: {idea.event_title}</p> {/* Show event title */}
              <p className="text-gray-300 text-xs">{idea.description}</p>
              <p className="text-gray-500 text-xs mt-1">Tech: {idea.technologies}</p>
              <p className="text-gray-500 text-xs">Likes: {idea.likes}</p>
              <p className="text-gray-500 text-xs">Status: {idea.is_built ? 'Built' : 'Not Built'}</p> {/* Display is_built status */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyIdeas;
