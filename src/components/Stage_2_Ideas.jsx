import { useState, useEffect } from 'react';
import { getIdeasByEvent, submitVote } from '../api/API';
import EditIdea from './EditIdea';

function Stage_2_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vottePromptVisible, setVottePromptVisible] = useState(false);
  const [confirmationPromptVisible, setConfirmationPromptVisible] = useState(false);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  const [currentIdeaName, setCurrentIdeaName] = useState('');
  const [votteRating, setVotteRating] = useState(1);
  const [voteError, setVoteError] = useState('');
  const [editingIdea, setEditingIdea] = useState(null);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        const stage2Ideas = eventIdeas.filter((idea) => idea.stage === 2); // Only stage 2 ideas
        setIdeas(stage2Ideas);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas.');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId]);

  const handleVotteClick = (ideaId, ideaName) => {
    setCurrentIdeaId(ideaId);
    setCurrentIdeaName(ideaName);
    setVottePromptVisible(true);
    setVoteError(''); // Reset error state
  };

  const handleSubmitVote = async () => {
    if (!currentIdeaId || !votteRating || !userEmail) {
      setVoteError('Missing required information for voting.');
      return;
    }

    try {
      await submitVote(currentIdeaId, userEmail, votteRating); // Call API
      setVottePromptVisible(false); // Close the votte prompt
      setConfirmationPromptVisible(true); // Show confirmation prompt
    } catch (err) {
      console.error('Error submitting vote:', err);
      setVoteError('Failed to submit vote. Please try again.');
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-5 space-y-4 border border-white"
      style={{ backgroundColor: 'transparent', maxHeight: '60vh', overflowY: 'auto' }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Stage 2 Ideas</h2>

      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-4 shadow hover:shadow-md transition-shadow duration-300 border border-green-500 glowing-border"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              {/* Votte Button */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleVotteClick(idea.id, idea.idea)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-all w-32"
                >
                  Votte
                </button>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                <p className="text-gray-100 mt-1">{idea.description}</p>
                <p className="text-sm text-gray-300">Tech Magic: {idea.technologies}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Votte Prompt */}
      {vottePromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-white">
              Rate "{currentIdeaName}" (1 to 10)
            </h3>
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
              onClick={handleSubmitVote}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Submit
            </button>
            {voteError && <p className="text-sm text-red-500 text-center">{voteError}</p>}
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

      {/* Edit Idea Modal */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <EditIdea ideaData={editingIdea} onEditSuccess={() => setEditingIdea(null)} />
          <button
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => setEditingIdea(null)}
          >
            Close
          </button>
        </div>
      )}

      {/* Inline Glowing Border */}
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

export default Stage_2_Ideas;
