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
      {/* Sticky Header */}
      <div
        className="p-4 border shadow-md"
        style={{
          backgroundColor: '#D6D6D6',
          border: '2px solid white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 className="text-xl font-bold text-black">Ideas I Liked</h2>
      </div>

      {/* Scrollable Ideas List with Shorter Height */}
      <div className="overflow-y-auto" style={{ maxHeight: '30vh', paddingTop: '10px' }}>
        {ideas.length === 0 ? (
          <div
            className="p-4 shadow-md border"
            style={{ backgroundColor: '#E0E0E0', textAlign: 'left' }}
          >
            <h3 className="text-lg font-bold text-black">You haven’t liked any ideas yet.</h3>
            <p className="text-gray-700 text-sm mt-2">
              Explore events and like ideas that inspire you!
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="p-3 shadow-md border relative"
                style={{
                  backgroundColor: '#D6D6D6',
                  fontSize: '14px',
                  padding: '8px',
                  border: '2px solid white',
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

                {/* Truncated Title and Description */}
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
                    className="text-gray-800 text-xs truncate mt-1"
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

export default LikedIdeas;
