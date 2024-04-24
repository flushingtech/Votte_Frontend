import React, { useState } from 'react';

const IdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);
  const [newIdeaText, setNewIdeaText] = useState('');

  const handleAddIdea = () => {
    if (newIdeaText.trim() !== '') {
      const newIdea = { text: newIdeaText, id: Date.now(), votes: 0 };
      setIdeaList([...ideaList, newIdea]);
      setNewIdeaText('');
    }
  };

  const handleVote = (id) => {
    const updatedIdeas = ideaList.map((idea) => {
      if (idea.id === id) {
        return { ...idea, votes: idea.votes + 1 };
      }
      return idea;
    });
    setIdeaList(updatedIdeas);
  };

  return (
    <div className="idea-container p-4 bg-black rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">List of Ideas</h2>
      <ul className="idea-list">
        {ideaList.map((idea) => (
          <li key={idea.id} className="idea-item bg-white rounded-md shadow-sm p-4 mb-4 flex justify-between items-center">
            <span className="text-lg text-gray-800">{idea.text}</span>
            <div className="vote-section flex items-center">
              <span className="text-sm text-gray-600 mr-2">Votes: {idea.votes}</span>
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
                onClick={() => handleVote(idea.id)}
              >
                Vote
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="add-idea mt-4 flex items-center">
        <input
          type="text"
          value={newIdeaText}
          onChange={(e) => setNewIdeaText(e.target.value)}
          className="p-2 border rounded-md mr-2 focus:outline-none"
          placeholder="Enter new idea..."
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
          onClick={handleAddIdea}
        >
          Add an Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaList;
