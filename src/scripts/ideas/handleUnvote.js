const handleUnvote = async (id, userId, fetchIdeas, fetchUserVotes) => {
    try {
      const response = await fetch(`http://localhost:3000/ideas/${id}/vote`, {
        method: 'DELETE', // Use DELETE method to remove vote
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // Pass userId to the backend for unvoting
      });
      if (!response.ok) {
        throw new Error('Failed to unvote for idea');
      }
      // After successful unvote, fetch updated idea list
      fetchIdeas();
      // Refresh user votes after unvoting
      fetchUserVotes();
    } catch (error) {
      console.error('Error unvoting for idea:', error);
    }
  };
  
  export default handleUnvote;
  