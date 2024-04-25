import React, { useState } from 'react';

const AddIdeaForm = ({ onAddIdea }) => {
  const [newIdeaText, setNewIdeaText] = useState('');

  const handleAddNewIdea = async () => {
    if (newIdeaText.trim() !== '') {
      await onAddIdea(newIdeaText);
      setNewIdeaText(''); // Clear input after adding idea
    }
  };

  return (
    <div className="add-idea mb-6 flex items-center justify-center">
      <input
        type="text"
        value={newIdeaText}
        onChange={(e) => setNewIdeaText(e.target.value)}
        className="p-2 border rounded-md mr-2 text-black focus:outline-none"
        placeholder="Enter new idea..."
      />
      <button
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
        onClick={handleAddNewIdea}
      >
        Add an Idea
      </button>
    </div>
  );
};

export default AddIdeaForm;
