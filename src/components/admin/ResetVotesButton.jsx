import React from 'react';
import resetIdeaVotes from '../../scripts/ideas/resetIdeaVotes'; // Import resetIdeaVotes function

const ResetVotesButton = ({ ideaId, fetchData }) => {
  const handleResetVotes = async () => {
    try {
      await resetIdeaVotes(ideaId); // Call the resetIdeaVotes function with the ideaId
      console.log(`Votes reset for idea with ID ${ideaId}`);
      fetchData(); // Refresh idea list after resetting votes
    } catch (error) {
      console.error(`Error resetting votes for idea with ID ${ideaId}:`, error.message);
      // Handle error appropriately (e.g., show error message to the user)
    }
  };

  return (
    <button className="px-4 py-2 bg-blue-500 text-white ml-4 " onClick={handleResetVotes}>
      Reset Votes
    </button>
  );
};

export default ResetVotesButton;
