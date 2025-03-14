import { useEffect, useState } from 'react';
import { getLikedIdeasByUser } from '../api/API';
import { useNavigate } from 'react-router-dom';

function LikedIdeas({ email }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleIdeaClick = (ideaId) => {
    if (ideaId) {
      navigate(`/idea/${ideaId}`);
    } else {
      console.error('Idea ID is undefined.');
    }
  };

  if (loading) return <p>Loading your liked ideas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="liked-ideas-section bg-transparent relative flex flex-col h-full">
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
        <h2 className="text-xl font-bold text-white">Ideas I Liked</h2>
      </div>

      {/* Scrollable Ideas List with White Background */}
      <div className="overflow-y-auto" style={{ maxHeight: '30vh', paddingTop: '8px' }}>
        {ideas.length === 0 ? (
          <div
            className="p-3 shadow-md border"
            style={{ backgroundColor: 'white', textAlign: 'left' }}
          >
            <h3 className="text-lg font-bold text-black">You haven’t liked any ideas yet.</h3>
            <p className="text-gray-700 text-sm mt-2">Explore events and like ideas that inspire you!</p>
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
                {/* "View Idea" Button in the Top-Right Corner */}
                <button
                  className="absolute top-2 right-2 text-xs font-semibold bg-black text-white px-2 py-1 hover:bg-gray-800 transition-all"
                  onClick={() => handleIdeaClick(idea.id)}
                  style={{
                    border: '1px solid #666',
                    borderRadius: '4px',
                  }}
                >
                  View Idea
                </button>

                {/* Idea Content */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <h3
                    className="text-sm font-bold text-black"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 1, // Ensures the title is max 1 line
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word', // Prevents long words from overflowing
                      maxWidth: '100%', // Keeps text within container
                    }}
                  >
                    {idea.idea}
                  </h3>
                  <p
                    className="text-gray-700 text-xs mt-1"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2, // Ensures descriptions are max 2 lines
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word', // Ensures long words wrap properly
                      maxWidth: '100%', // Prevents text from exceeding container width
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

export default LikedIdeas;
