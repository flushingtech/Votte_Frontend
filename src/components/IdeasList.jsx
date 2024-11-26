import { useState, useEffect } from 'react';
import { getIdeasByEvent, getLikedIdeas, deleteIdea } from '../api/API';
import LikeButton from './LikeButton';
import EditIdea from './EditIdea';

function IdeasList({ eventId, refreshIdeas }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin')) || false;
  const [userLikedIdeas, setUserLikedIdeas] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);

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
        console.error('Error fetching ideas by event:', err);
        setError('Failed to load ideas');
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
      alert('Failed to delete idea');
    }
  };

  const handleEditSuccess = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
    setEditingIdea(null);
  };

  const closeEditModal = () => {
    setEditingIdea(null);
  };

  const handleReport = (ideaId) => {
    alert(`Reported idea with ID: ${ideaId}`);
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading ideas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-5 space-y-4 border border-white"
      style={{
        backgroundColor: 'transparent',
        maxHeight: '60vh', // Limit height to 60% of the viewport
        overflowY: 'auto', // Enable vertical scrolling when necessary
      }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Ideas</h2>
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">
          No ideas have been submitted for this event yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-4 shadow hover:shadow-md transition-shadow duration-300 border border-gray-500"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              {/* Like Button in Top Right */}
              <div className="absolute top-2 right-2">
                <LikeButton
                  ideaId={idea.id}
                  currentUserEmail={userEmail}
                  initialLikes={idea.likes}
                  hasLiked={userLikedIdeas.includes(idea.id)}
                  onLikeChange={(updatedIdea) =>
                    setIdeas((prevIdeas) =>
                      prevIdeas.map((i) =>
                        i.id === updatedIdea.id ? updatedIdea : i
                      )
                    )
                  }
                />
              </div>

              {/* Menu Trigger in Bottom Right */}
              {(idea.email === userEmail || isAdmin) && (
                <div className="absolute bottom-2 right-2">
                  <button
                    className="text-white text-xl hover:text-gray-300"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === idea.id ? null : idea.id)
                    }
                  >
                    ...
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpenId === idea.id && (
                    <div
                      className="absolute bg-white shadow-lg rounded p-2 z-50 text-black"
                      style={{
                        bottom: '100%',
                        right: '0',
                        marginBottom: '-12px',
                      }}
                    >
                      {idea.email === userEmail && (
                        <button
                          className="px-4 py-2 text-sm hover:bg-gray-200 text-left border-b"
                          onClick={() => setEditingIdea(idea)}
                        >
                          Edit
                        </button>
                      )}
                      {(isAdmin || idea.email === userEmail) && (
                        <button
                          className="px-4 py-2 text-sm hover:bg-gray-200 text-left border-b"
                          onClick={() => handleDelete(idea.id)}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        className="px-4 py-2 text-sm hover:bg-gray-200 text-left"
                        onClick={() => handleReport(idea.id)}
                      >
                        Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="pr-4">
                <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                <p className="text-gray-100 mt-1">{idea.description}</p>
                <p className="text-sm text-gray-300">
                  Tech Magic: {idea.technologies}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Status: {idea.is_built ? 'Built' : 'Not Built'}
                </p>
                <p className="text-sm text-gray-400 mt-2">By: {idea.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {editingIdea && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 max-w-2xl mx-auto rounded-lg space-y-4 w-11/12 md:w-1/2">
              <h2 className="text-2xl font-bold text-white text-center">
                Edit Idea
              </h2>
              <EditIdea ideaData={editingIdea} onEditSuccess={handleEditSuccess} />
              <button
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 font-semibold hover:bg-red-700 focus:outline-none"
                onClick={closeEditModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IdeasList;
