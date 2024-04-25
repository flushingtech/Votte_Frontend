const handleVote = async (id, userId, fetchIdeas, fetchUserVotes) => {
    console.log('User ID:', userId); // Log user ID before voting
    try {
      const response = await fetch(`http://localhost:3000/ideas/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // Pass userId to the backend
      });
      if (!response.ok) {
        throw new Error('Failed to vote for idea');
      }
      // After successful vote, fetch updated idea list
      fetchIdeas();
      // Refresh user votes after voting
      fetchUserVotes();
    } catch (error) {
      console.error('Error voting for idea:', error);
    }
  };
  
  export default handleVote;
  