import { useEffect, useState } from 'react';
import { getLikedIdeasByUser } from '../api/API';

function LikedIdeas({ email }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikedIdeas = async () => {
      try {
        const likedIdeas = await getLikedIdeasByUser(email);
        setIdeas(likedIdeas);
      } catch (err) {
        console.error('Error fetching liked ideas:', err);
        setError('Failed to load liked ideas');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchLikedIdeas();
    }
  }, [email]);

  if (loading) return <p>Loading your liked ideas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="liked-ideas-section bg-transparent">
      <h2 className="text-xl font-bold text-white mb-2">Ideas I Liked</h2>
      {ideas.length === 0 ? (
        <div
          className="p-4 shadow-md border"
          style={{ backgroundColor: '#1E2A3A', textAlign: 'left' }}
        >
          <h3 className="text-lg font-bold text-white">You haven’t liked any ideas yet.</h3>
          <p className="text-gray-400 text-sm mt-2">
            Explore events and like ideas that inspire you!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea) => (
            <li key={idea.id} className="p-3 shadow-md border" style={{ backgroundColor: '#1E2A3A' }}>
              <h3 className="text-lg font-bold text-white">{idea.idea}</h3>
              <p className="text-gray-400 text-sm">Event: {idea.event_title}</p> {/* Display event title */}
              <p className="text-gray-300 text-xs">{idea.description}</p>
              <p className="text-gray-500 text-xs mt-1">Tech: {idea.technologies}</p>
              <p className="text-gray-500 text-xs">Likes: {idea.likes}</p> {/* Updated label */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LikedIdeas;
