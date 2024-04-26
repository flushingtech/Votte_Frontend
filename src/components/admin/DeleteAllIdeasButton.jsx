import React from 'react';

const DeleteAllIdeasButton = ({ onDeleteAllClick }) => {
  const handleDeleteAllClick = () => {
    onDeleteAllClick();
  };

  return (
    <button className="px-4 py-2 bg-red-500 text-white" onClick={handleDeleteAllClick}>
      Delete All Ideas
    </button>
  );
};

export default DeleteAllIdeasButton;
