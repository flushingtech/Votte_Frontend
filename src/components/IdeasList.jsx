import { useState, useEffect } from 'react';
import {
  getIdeasByEvent,
  getLikedIdeas,
  deleteIdea,
  getEventStage,
  submitVote,
} from '../api/API'; // Ensure submitVote aligns with your backend route
import LikeButton from './LikeButton';
import EditIdea from './EditIdea';

function IdeasList({ eventId, refreshIdeas }) {
  const [ideas, setIdeas] = useState([]);
  const [eventStage, setEventStage] = useState(1); // State to track the event stage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vottePromptVisible, setVottePromptVisible] = useState(false); // State for votte prompt visibility
  const [confirmationPromptVisible, setConfirmationPromptVisible] = useState(false); // State for confirmation card
  const [votteRating, setVotteRating] = useState(1); // State for votte rating
  const [currentIdeaId, setCurrentIdeaId] = useState(null); // State for tracking current idea ID
  const [currentIdeaName, setCurrentIdeaName] = useState(''); // State for current idea name
  const [menuOpenId, setMenuOpenId] = useState(null); // State to track which menu is open
  const userEmail = localStorage.getItem('userEmail');
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin')) || false;
  const [editingIdea, setEditingIdea] = useState(null); // State for EditIdea modal
  const [userLikedIdeas, setUserLikedIdeas] = useState([]); // Track user liked ideas

  useEffect(() => {
    const fetchIdeasAndStage = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas);

        // Fetch the stage of the event
        const eventStageData = await getEventStage(eventId);
        setEventStage(eventStageData.stage);

        if (userEmail) {
          const likedIdeas = await getLikedIdeas(userEmail);
          setUserLikedIdeas(likedIdeas);
        }
      } catch (err) {
        console.error('Error fetching ideas or event stage:', err);
        setError('Failed to load ideas or event stage');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeasAndStage();
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
    setEditingIdea(null); // Close the edit modal
  };

  const closeEditModal = () => {
    setEditingIdea(null); // Close the edit modal
  };

  const handleReport = (ideaId) => {
    alert(`Reported idea with ID: ${ideaId}`);
  };

  const handleVotteClick = (ideaId, ideaName) => {
    setCurrentIdeaId(ideaId);
    setCurrentIdeaName(ideaName);
    setVottePromptVisible(true);
  };

  const handleSubmitVotte = async () => {
    try {
      await submitVote(currentIdeaId, userEmail, votteRating); // Pass parameters directly to match the backend
      setVottePromptVisible(false); // Close the votte prompt
      setConfirmationPromptVisible(true); // Show the confirmation card
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
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
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Ideas</h2>

      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">
          No ideas have been submitted for this event yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {ideas
            .filter((idea) => eventStage === 1 || idea.stage === 2) // Show only stage 2 ideas if event is in stage 2
            .map((idea) => (
              <li
                key={idea.id}
                className={`relative p-4 shadow hover:shadow-md transition-shadow duration-300 border ${
                  idea.stage === 2 ? 'border-green-500 glowing-border' : 'border-gray-500'
                }`}
                style={{ backgroundColor: '#1E2A3A' }}
              >
                {/* Votte or Like Button in Top Right */}
                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                  {eventStage === 2 ? (
                    <button
                      onClick={() => handleVotteClick(idea.id, idea.idea)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-all w-32"
                    >
                      Votte
                    </button>
                  ) : (
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
                  )}
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
                        <button
                          className="px-4 py-2 text-sm hover:bg-gray-200 text-left border-b"
                          onClick={() => setEditingIdea(idea)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 text-sm hover:bg-gray-200 text-left border-b"
                          onClick={() => handleDelete(idea.id)}
                        >
                          Delete
                        </button>
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

      {/* Votte Prompt */}
      {vottePromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-white">Rate this idea (1 to 10)</h3>
            <input
              type="range"
              min="1"
              max="10"
              value={votteRating}
              onChange={(e) => setVotteRating(e.target.value)}
              className="w-full"
            />
            <p className="text-white text-center">Rating: {votteRating}</p>
            <button
              onClick={handleSubmitVotte}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Prompt */}
      {confirmationPromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto space-y-4 text-center">
            <h3 className="text-lg font-bold text-white">
              You voted a {votteRating} for "{currentIdeaName}"
            </h3>
            <button
              onClick={() => setConfirmationPromptVisible(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
{/* EditIdea Prompt */}
{editingIdea && (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center"
    style={{ margin: 0, padding: 0 }}
  >
    <EditIdea ideaData={editingIdea} onEditSuccess={handleEditSuccess} />
    <button
      className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
      onClick={closeEditModal}
    >
      Close
    </button>
  </div>
)}


      {/* Inline CSS for glowing border */}
      <style jsx>{`
        .glowing-border {
          animation: glowing 1.5s infinite;
        }

        @keyframes glowing {
          0% {
            box-shadow: 0 0 5px #00ff00;
          }
          50% {
            box-shadow: 0 0 20px #00ff00;
          }
          100% {
            box-shadow: 0 0 5px #00ff00;
          }
        }
      `}</style>
    </div>
  );
}

export default IdeasList;
