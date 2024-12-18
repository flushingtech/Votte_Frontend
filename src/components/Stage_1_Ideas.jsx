import { useState, useEffect } from 'react';
import { getIdeasByEvent, getLikedIdeas, deleteIdea } from '../api/API';
import LikeButton from './LikeButton';
import EditIdea from './EditIdea';

function Stage_1_Ideas({ eventId, refreshIdeas }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [userLikedIdeas, setUserLikedIdeas] = useState([]);
  const userEmail = localStorage.getItem('userEmail');
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin')) || false;

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas);

        if (userEmail) {
          const likedIdeas = await getLikedIdeas(userEmail);
          setUserLikedIdeas(likedIdeas);
        }
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas.');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId, userEmail]);

  const handleDelete = async (ideaId) => {
    try {
      await deleteIdea(ideaId, userEmail);
      setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
      if (refreshIdeas) refreshIdeas();
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea.');
    }
  };

  const handleEditSuccess = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
    setEditingIdea(null);
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white"
      style={{
        backgroundColor: 'transparent',
        maxHeight: '68vh',
        overflowY: 'auto',
      }}
    >
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas have been submitted yet.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-2 shadow border border-gray-500"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              {/* Like Button */}
              <div className="absolute top-2 right-2">
                <LikeButton
                  ideaId={idea.id}
                  currentUserEmail={userEmail}
                  initialLikes={idea.likes}
                  hasLiked={userLikedIdeas.includes(idea.id)}
                  onLikeChange={(updatedIdea) =>
                    setIdeas((prevIdeas) =>
                      prevIdeas.map((i) => (i.id === updatedIdea.id ? updatedIdea : i))
                    )
                  }
                />
              </div>

              {/* Menu Options */}
              {(idea.email === userEmail || isAdmin) && (
                <div className="absolute bottom-2 right-2">
                  <button
                    className="text-white text-sm hover:text-gray-300"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === idea.id ? null : idea.id)
                    }
                  >
                    ...
                  </button>
                  {menuOpenId === idea.id && (
                    <div
                      className="absolute bg-white shadow-lg p-1 z-50 text-black"
                      style={{
                        bottom: '100%',
                        right: '0',
                        marginBottom: '-8px',
                      }}
                    >
                      <button
                        className="px-3 py-1 text-xs hover:bg-gray-200 text-left border-b"
                        onClick={() => setEditingIdea(idea)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-xs hover:bg-gray-200 text-left"
                        onClick={() => handleDelete(idea.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Idea Content */}
              <div>
                <h3 className="text-sm font-bold text-white">{idea.idea}</h3>
                <p className="text-xs text-gray-100 mt-1">{idea.description}</p>
                <p className="text-xs text-gray-300">Tech Magic: {idea.technologies}</p>
                <p className="text-xs text-gray-400 mt-1">By: {idea.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* EditIdea Modal */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <EditIdea ideaData={editingIdea} onEditSuccess={handleEditSuccess} />
          <button
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => setEditingIdea(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Stage_1_Ideas;
