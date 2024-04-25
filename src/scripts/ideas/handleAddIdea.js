const handleAddIdea = async (newIdeaText, fetchIdeas, setNewIdeaText) => {
    if (newIdeaText.trim() !== '') {
      try {
        const response = await fetch('http://localhost:3000/ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newIdeaText }),
        });
        if (!response.ok) {
          throw new Error('Failed to add idea');
        }
        // Refresh idea list after adding new idea
        fetchIdeas();
        setNewIdeaText('');
      } catch (error) {
        console.error('Error adding idea:', error);
      }
    }
  };
  
  export default handleAddIdea;
  