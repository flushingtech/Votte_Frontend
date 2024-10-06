import { useState, useEffect } from 'react';
import { voteForIdea, unvoteForIdea } from '../api/API';  // Import the unvote function

function VoteButton({ ideaId, currentUserEmail, initialVotes, hasVoted, onVoteChange }) {
  const [votes, setVotes] = useState(initialVotes);  // Track the vote count
  const [voted, setVoted] = useState(hasVoted);  // Track if the user has voted
  const [error, setError] = useState('');

  useEffect(() => {
    setVoted(hasVoted);  // Update the state if props change
  }, [hasVoted]);

  // Handle the vote action
  const handleVote = async () => {
    try {
      const response = await voteForIdea(ideaId, currentUserEmail);
      setVotes(response.idea.votes);  // Update the vote count locally
      setVoted(true);  // Mark as voted
      if (onVoteChange) onVoteChange(response.idea);
    } catch (err) {
      console.error('Error voting for idea:', err);
      setError('Failed to vote. You may have reached the vote limit.');
    }
  };

  // Handle the unvote action
  const handleUnvote = async () => {
    try {
      const response = await unvoteForIdea(ideaId, currentUserEmail);
      setVotes(response.idea.votes);  // Update the vote count locally
      setVoted(false);  // Mark as not voted
      if (onVoteChange) onVoteChange(response.idea);
    } catch (err) {
      console.error('Error unvoting for idea:', err);
      setError('Failed to unvote.');
    }
  };

  return (
    <div className="vote-button">
      {voted ? (
        <button
          className="mt-2 bg-red-600 text-white py-2 px-4 text-sm font-semibold hover:bg-red-700 focus:outline-none"
          onClick={handleUnvote}
        >
          Unvote
        </button>
      ) : (
        <button
          className="mt-2 bg-green-600 text-white py-2 px-4 text-sm font-semibold hover:bg-green-700 focus:outline-none"
          onClick={handleVote}
        >
          Vote
        </button>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {/* <p className="text-gray-500 text-sm mt-1">Votes: {votes}</p>  Display the vote count */}
    </div>
  );
}

export default VoteButton;
