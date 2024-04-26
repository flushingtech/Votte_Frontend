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
        className="p-4 border mr-2 text-black focus:outline-none flex-grow" // Use flex-grow to expand input
        style={{ maxWidth: '100%' }} // Set maximum width to 100% to ensure it expands
        placeholder="Enter new idea..."
      />
      <button
        className="px-4 py-4 bg-green-500 text-white  hover:bg-green-600 focus:outline-none"
        onClick={handleAddNewIdea}
      >
        Add an Idea
      </button>
    </div>
  );
};

export default AddIdeaForm;
