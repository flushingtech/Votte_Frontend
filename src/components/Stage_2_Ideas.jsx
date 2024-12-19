import { useState, useEffect } from 'react';
import { getIdeasByEvent, submitVote } from '../api/API';

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
      className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white"
      style={{ backgroundColor: 'transparent', maxHeight: '60vh', overflowY: 'auto' }}
    >
      {/* Header */}
      <h2 className="text-lg font-bold text-center text-white mb-2">Stage 2: Voting</h2>

      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-2 border border-green-500 shadow"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              {/* Content */}
              <div>
                <h3 className="text-sm font-bold text-white">{idea.idea}</h3>
                <p className="text-xs text-gray-300 mt-1">{idea.description}</p>
              </div>

              {/* Votte Button */}
              <button
                onClick={() => handleVotteClick(idea.id, idea.idea)}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-all"
              >
                Votte
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Votte Prompt */}
      {vottePromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-white">
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
            <p className="text-xs text-white text-center">Rating: {votteRating}</p>
            <button
              onClick={handleSubmitVote}
              className="w-full bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
            {voteError && <p className="text-xs text-red-500 text-center">{voteError}</p>}
          </div>
        </div>
      )}

      {/* Confirmation Prompt */}
      {confirmationPromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg max-w-md mx-auto space-y-2 text-center">
            <h3 className="text-sm font-bold text-white">
              You voted a {votteRating} for "{currentIdeaName}"
            </h3>
            <button
              onClick={() => setConfirmationPromptVisible(false)}
              className="w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stage_2_Ideas;
