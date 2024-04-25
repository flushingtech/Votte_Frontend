const fetchUserVotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/votes');
      if (!response.ok) {
        throw new Error('Failed to fetch user votes');
      }
      const votes = await response.json();
      return votes;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return [];
    }
  };
  
  export default fetchUserVotes;
  