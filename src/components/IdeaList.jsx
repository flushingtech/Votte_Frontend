import React, { useState } from 'react';
import '../styles/IdeaList.css';

const IdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);
  const [newIdeaText, setNewIdeaText] = useState('');

  const handleAddIdea = () => {
    if (newIdeaText.trim() !== '') {
      const newIdea = { text: newIdeaText, id: Date.now() };
      setIdeaList([...ideaList, newIdea]);
      setNewIdeaText('');
    }
  };

  return (
    <div className="idea-container">
      <h2>List of Ideas</h2>
      <ul className="idea-list">
        {ideaList.map((idea) => (
          <li key={idea.id}>{idea.text}</li>
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
