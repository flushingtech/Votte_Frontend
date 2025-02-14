import React, { useState, useEffect } from 'react';
import { getIdeasByEvent, submitVote, unvote, getUserVote } from '../api/API';

function Stage_2_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteError, setVoteError] = useState('');

  const userEmail = localStorage.getItem('userEmail');
  const voteType = "Most Creative"; // Keep this fixed for this screen

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        console.log("Fetched ideas:", eventIdeas); // Debugging log
  
        const stage2Ideas = eventIdeas.filter((idea) => idea.stage === 2);
        setIdeas(stage2Ideas);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    };
  
    const fetchUserVote = async () => {
      try {
        const userVoteData = await getUserVote(userEmail, eventId, voteType);
        console.log("User's existing vote:", userVoteData); // Debugging log
        setUserVote(userVoteData);
      } catch (err) {
        console.error("Error fetching user vote:", err);
        // Do NOT set global error here, just log the issue
      }
    };
  
    fetchIdeas();
    fetchUserVote();
  }, [eventId, voteType, userEmail]);
  
  

  const handleVoteClick = async (ideaId) => {
    if (!userEmail) {
      setVoteError('User email not found.');
      return;
    }
  
    setVoting(true);
    setVoteError('');
  
    try {
      if (userVote === ideaId) {
        // Unvote
        await unvote(userEmail, ideaId, eventId, voteType);
        setUserVote(null);
      } else {
        // Vote
        await submitVote(ideaId, userEmail, eventId, voteType);
        setUserVote(ideaId);
      }
    } catch (err) {
      console.error('Error handling vote:', err.response?.data || err.message);
      setVoteError('Failed to process vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };  

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white" style={{ backgroundColor: 'transparent', maxHeight: '60vh', overflowY: 'auto' }}>
      <h2 className="text-lg font-bold text-white">Vote for the Most Creative Idea!</h2>

      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li key={idea.id} className="relative p-2 border border-green-500 shadow" style={{ backgroundColor: '#1E2A3A' }}>
              <div>
                <h3 className="text-sm font-bold text-white">{idea.idea}</h3>
                <p className="text-xs text-gray-300 mt-1">{idea.description}</p>
              </div>
              <button
                onClick={() => handleVoteClick(idea.id)}
                className={`absolute top-2 right-2 px-2 py-1 text-xs ${
                  userVote === idea.id ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } text-white rounded transition-all`}
                disabled={voting}
              >
                {userVote === idea.id ? 'Unvote' : 'Vote Most Creative'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {voteError && <p className="text-xs text-red-500 text-center">{voteError}</p>}
    </div>
  );
}

export default Stage_2_Ideas;
