// AdminIdeaList.jsx
import React, { useState, useEffect } from 'react';
import AddIdeaForm from '../AddIdeaForm';
import fetchIdeas from '../../scripts/ideas/fetchIdeas';
import handleAddIdea from '../../scripts/ideas/handleAddIdea';
import handleDeleteIdea from '../../scripts/ideas/handleDeleteIdea'; // Import delete idea handler
import ResetAllVotesButton from './ResetAllVotesButton'; // Import ResetAllVotesButton component
import ResetVotesButton from './ResetVotesButton'; // Import ResetVotesButton component
import DeleteIdeaButton from './DeleteIdeaButton'; // Import DeleteIdeaButton component
import DeleteAllIdeasButton from './DeleteAllIdeasButton'; // Import DeleteAllIdeas component
import handleDeleteAllIdeas from '../../scripts/ideas/handleDeleteAllIdeas'; // Import handleDeleteAllIdeas function
import '../../styles/IdeaList.css'; // Import a CSS file for custom styles

const AdminIdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);

  // Function to fetch ideas from backend
  const fetchData = async () => {
    const ideas = await fetchIdeas();
    setIdeaList(ideas);
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run once on mount

  const handleAddNewIdea = async (text) => {
    await handleAddIdea(text);
    fetchData(); // Refresh data after adding idea
  };

  const handleDeleteButtonClick = async (id) => {
    await handleDeleteIdea(id);
    fetchData(); // Refresh data after deleting idea
  };

  const handleDeleteAllIdeasClick = async () => {
    const success = await handleDeleteAllIdeas();
    if (success) {
      fetchData(); // Refresh idea list after deleting all ideas
    }
  };

  return (
    <div className="idea-container p-4 bg-black rounded-md shadow-md font-bold text-center">
      {/* <AddIdeaForm onAddIdea={handleAddNewIdea} /> */}
      <ResetAllVotesButton /> {/* Add ResetAllVotesButton component */}
      <DeleteAllIdeasButton onDeleteAllClick={handleDeleteAllIdeasClick} /> {/* Add DeleteAllIdeas component */}
      <ul>
        {ideaList.map((idea) => (
          <li
            key={idea.id}
            className="idea-card shadow-sm pl-2 mb-2 flex justify-between items-center"
            style={{ background: 'white' }}
          >
            <span className="text-lg text-gray-800">{idea.text}</span>
            <div className="vote-section flex items-center">
              <span className="text-sm text-gray-600 mr-2">Votes: {idea.votes}</span> {/* Display total votes */}
              <ResetVotesButton ideaId={idea.id} fetchData={fetchData} /> {/* Pass ideaId and fetchData to ResetVotesButton */}
              <DeleteIdeaButton onDeleteButtonClick={handleDeleteButtonClick} ideaId={idea.id} /> {/* Pass onDeleteButtonClick and ideaId to DeleteIdeaButton */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminIdeaList;
