const handleDeleteAllIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3000/ideas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers if required
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete all ideas');
      }
  
      // Ideas deleted successfully
      console.log('All ideas deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting all ideas:', error.message);
      // Handle error appropriately (e.g., show error message to the user)
      return false;
    }
  };
  
  export default handleDeleteAllIdeas;
  