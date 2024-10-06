import { useState } from 'react';
import { editIdea } from '../api/API';

function EditIdea({ ideaData, onEditSuccess }) {
  const [idea, setIdea] = useState(ideaData.idea);
  const [description, setDescription] = useState(ideaData.description);
  const [technologies, setTechnologies] = useState(ideaData.technologies); // New state for technologies
  const [message, setMessage] = useState('');

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await editIdea(ideaData.id, idea, description, technologies);  // Call the edit function from api.js
      setMessage('Idea updated successfully!');
      
      // Call the success handler to refresh the ideas list
      if (onEditSuccess) {
        onEditSuccess(response.idea);
      }
    } catch (error) {
      console.error('Error editing idea:', error);
      setMessage('Failed to update idea');
    }
  };

  return (
    <form onSubmit={handleEdit} className="p-4 border border-gray-300 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Edit Idea:</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Edit your idea here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Edit Description:</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Edit your description here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Edit Technologies:</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Edit technologies here..."
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 focus:outline-none">
        Update Idea
      </button>
      {message && <p className="text-sm mt-2 text-green-500">{message}</p>}
    </form>
  );
}

export default EditIdea;
