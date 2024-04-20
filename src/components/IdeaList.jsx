import React from 'react';
import '../styles/IdeaList.css'

const IdeaList = ({ ideas }) => {

  
  return (
    <div className="idea-container">
      <h2>List of Ideas</h2>
      <ul className="idea-list">
        {ideas.map((idea, index) => (
          <li key={index}>{idea}</li>
        ))}
      </ul>
    </div>
  );
};

export default IdeaList;
