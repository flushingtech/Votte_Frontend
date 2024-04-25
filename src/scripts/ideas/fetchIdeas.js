const fetchIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3000/ideas');
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const ideas = await response.json();
      return ideas;
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return [];
    }
  };
  
  export default fetchIdeas;
  