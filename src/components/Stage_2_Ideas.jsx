import { useState, useEffect } from 'react';
import { getIdeasByEvent, submitMostCreativeVote } from '../api/API';

function Stage_2_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [confirmationPromptVisible, setConfirmationPromptVisible] = useState(false);
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

  const handleVoteClick = (idea) => {
    setSelectedIdea(idea);
    setConfirmationPromptVisible(true);
    setVoteError('');
  };

  const handleSubmitVote = async () => {
    if (!selectedIdea || !userEmail) {
      setVoteError('Please select an idea before submitting.');
      return;
    }

    try {
      await submitMostCreativeVote(userEmail, selectedIdea.id, eventId); // Call API
      setConfirmationPromptVisible(false); // Close confirmation prompt
      alert(`You voted "${selectedIdea.idea}" as the Most Creative Idea!`);
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
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className={`relative p-4 border border-green-500 shadow ${
                selectedIdea?.id === idea.id ? 'bg-green-700' : 'bg-[#1E2A3A]'
              }`}
            >
              {/* Idea Details */}
              <h3 className="text-lg font-bold text-white">{idea.idea}</h3>
              <p className="text-sm text-gray-300 mt-1">{idea.description}</p>

              {/* Vote Button */}
              <button
                onClick={() => handleVoteClick(idea)}
                className="absolute top-3 right-3 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-all"
              >
                {selectedIdea?.id === idea.id ? 'Selected' : 'Vote'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Prompt */}
      {confirmationPromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto text-center">
            <h3 className="text-lg font-bold text-white">
              Confirm your vote for "{selectedIdea?.idea}" as the Most Creative Idea?
            </h3>
            <div className="mt-4 space-x-2">
              <button
                onClick={handleSubmitVote}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes, Submit
              </button>
              <button
                onClick={() => setConfirmationPromptVisible(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            {voteError && <p className="text-sm text-red-500 mt-2">{voteError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Stage_2_Ideas;
