import React, { useState, useEffect } from 'react';
import AddIdeaForm from './AddIdeaForm';
import fetchIdeas from '../scripts/ideas/fetchIdeas';
import fetchUserVotes from '../scripts/ideas/fetchUserVotes';
import handleAddIdea from '../scripts/ideas/handleAddIdea';
import handleVote from '../scripts/ideas/handleVote';
import handleUnvote from '../scripts/ideas/handleUnvote';
import hasVoted from '../scripts/ideas/hasVoted';

const IdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);
  const [userVotes, setUserVotes] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null); // Track which idea ID is being hovered over
  const userId = 123; // Replace with actual user ID

  // Function to fetch ideas and user votes from backend
  const fetchData = async () => {
    const ideas = await fetchIdeas();
    setIdeaList(ideas);

    const votes = await fetchUserVotes();
    const userVoteSet = new Set(votes.map((vote) => vote.idea_id));
    setUserVotes(userVoteSet);
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run once on mount

  const handleAddNewIdea = async (text) => {
    await handleAddIdea(text);
    fetchData(); // Refresh data after adding idea
  };

  const handleVoteForIdea = async (id) => {
    await handleVote(id, userId);
    fetchData(); // Refresh data after voting
  };

  const handleUnvoteForIdea = async (id) => {
    await handleUnvote(id, userId);
    fetchData(); // Refresh data after unvoting
  };

  return (
    <div className="idea-container p-8 bg-black rounded-md shadow-md text-center">
      <AddIdeaForm onAddIdea={handleAddNewIdea} />

      <ul>
        {ideaList.map((idea) => (
          <li
            key={idea.id}
            className="bg-white rounded-md shadow-sm p-4 mb-2 flex justify-between items-center"
            onMouseEnter={() => setHoveredId(idea.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="text-lg text-gray-800">{idea.text}</span>
            <div className="vote-section flex items-center">
              <span className="text-sm text-gray-600 mr-2">Votes: {idea.votes}</span>
              {hasVoted(userVotes, idea.id) ? (
                hoveredId === idea.id ? (
                  <button
                    className="px-4 py-1 bg-red-500 text-white rounded-md"
                    onClick={() => handleUnvoteForIdea(idea.id)}
                  >
                    Unvote?
                  </button>
                ) : (
                  <button className="px-6 py-1 bg-green-500 text-white rounded-md">
                    Voted
                  </button>
                )
              ) : (
                <button
                  className="px-7 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
                  onClick={() => handleVoteForIdea(idea.id)}
                >
                  Vote
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IdeaList;
