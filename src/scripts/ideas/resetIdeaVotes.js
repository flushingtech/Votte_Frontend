const resetIdeaVotes = async (ideaId) => {
  try {
    const response = await fetch(`http://localhost:3000/ideas/${ideaId}/reset-votes`, {
      method: 'PUT', // Updated to use PUT method
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers if required
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset votes for the idea');
    }
  } catch (error) {
    throw new Error(`Error resetting votes for the idea: ${error.message}`);
  }
};

export default resetIdeaVotes;