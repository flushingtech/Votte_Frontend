import React, { useState } from 'react';
import '../styles/IdeaList.css';

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
    <div className="idea-container">
      <h2>List of Ideas</h2>
      <ul className="idea-list">
        {ideaList.map((idea) => (
          <li key={idea.id} className="idea-item">
            <span>{idea.text}</span>
            <div className="vote-section">
              <span>Votes: {idea.votes}</span>
              <button onClick={() => handleVote(idea.id)}>Vote</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="add-idea">
        <input
          type="text"
          value={newIdeaText}
          onChange={(e) => setNewIdeaText(e.target.value)}
          placeholder="Enter new idea..."
        />
        <button onClick={handleAddIdea}>Add an Idea</button>
      </div>
    </div>
  );
};

export default IdeaList;
