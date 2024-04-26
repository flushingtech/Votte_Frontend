const resetAllVotes = async () => {
  try {
    const response = await fetch('http://localhost:3000/ideas/reset-votes', {
      method: 'PUT', // Updated to use PUT method
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers if required
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset all votes');
    }
  } catch (error) {
    throw new Error(`Error resetting all votes: ${error.message}`);
  }
};

export default resetAllVotes;