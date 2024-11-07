import { useState, useEffect } from 'react';
import { getIdeasByEvent, getLikedIdeas } from '../api/API';
import LikeButton from './LikeButton';

function IdeasList({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const [userLikedIdeas, setUserLikedIdeas] = useState([]); // Track ideas user has liked

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        // Fetch the ideas for the event
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas);

        // Fetch the user's liked ideas
        if (userEmail) {
          const likedIdeas = await getLikedIdeas(userEmail);
          setUserLikedIdeas(likedIdeas);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching ideas by event:', err);
        setError('Failed to load ideas');
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId, userEmail]);

  const handleLikeChange = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading ideas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="ideas-list max-w-3xl mx-auto my-4 p-5 space-y-4" style={{ backgroundColor: 'transparent' }}>
      <h2 className="text-2xl font-bold mb-2 text-white">Ideas</h2>
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas have been submitted for this event yet.</p>
      ) : (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-2 shadow hover:shadow-md transition-shadow duration-300 border"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                <p className="text-gray-400 text-xs">By: {idea.email}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="max-w-xs">
                  <p className="text-gray-100 mt-0">{idea.description}</p>
                  <p className="text-sm text-gray-300">Tech Magic: {idea.technologies}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Status: {idea.is_built ? "Built" : "Not Built"}
                  </p> {/* Display built status */}
                </div>
                <p className="text-sm text-gray-300 leading-loose">Likes: {idea.likes}</p>
              </div>
              <LikeButton
                ideaId={idea.id}
                currentUserEmail={userEmail}
                initialLikes={idea.likes}
                hasLiked={userLikedIdeas.includes(idea.id)} // Check if user has liked this idea
                onLikeChange={handleLikeChange} // Callback to update likes in IdeasList
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IdeasList;
