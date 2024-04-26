import React from 'react';

const DeleteIdeaButton = ({ onDeleteButtonClick, ideaId }) => {
  const handleDeleteClick = () => {
    onDeleteButtonClick(ideaId);
  };

  return (
    <button
      className="px-4 py-2 bg-red-500 text-white ml-4"
      onClick={handleDeleteClick}
    >
      Delete
    </button>
  );
};

export default DeleteIdeaButton;
