import React from 'react';
import resetAllVotes from '../../scripts/ideas/resetAllVotes'; // Import resetAllVotes function

const ResetAllVotesButton = () => {
  const handleResetAllVotes = async () => {
    try {
      await resetAllVotes(); // Call the resetAllVotes function
      console.log('All votes reset successfully');
      // Add any additional logic after resetting all votes if needed
    } catch (error) {
      console.error('Error resetting all votes:', error.message);
      // Handle error appropriately (e.g., show error message to the user)
    }
  };

  return (
    <button className="px-4 py-2 bg-green-500 text-white mb-4" onClick={handleResetAllVotes}>
      Reset All Votes
    </button>
  );
};

export default ResetAllVotesButton;
