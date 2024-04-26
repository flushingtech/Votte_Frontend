const handleDeleteIdea = async (id) => {
    try {
      // Make a DELETE request to your backend API endpoint to delete the idea
      const response = await fetch(`http://localhost:3000/ideas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers if required
        },
      });
  
      if (!response.ok) {
        // Handle error response from the server
        throw new Error('Failed to delete idea');
      }
  
      // Idea deleted successfully
      console.log(`Deleted idea with ID: ${id}`);
    } catch (error) {
      console.error('Error deleting idea:', error.message);
      // Handle error appropriately (e.g., show error message to the user)
    }
  };
  
  export default handleDeleteIdea;
  