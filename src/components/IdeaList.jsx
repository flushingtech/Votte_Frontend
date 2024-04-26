import React, { useState, useEffect } from 'react';
import AddIdeaForm from './AddIdeaForm';
import fetchIdeas from '../scripts/ideas/fetchIdeas';
import fetchUserVotes from '../scripts/ideas/fetchUserVotes';
import handleAddIdea from '../scripts/ideas/handleAddIdea';
import handleVote from '../scripts/ideas/handleVote';
import handleUnvote from '../scripts/ideas/handleUnvote';
import hasVoted from '../scripts/ideas/hasVoted';
import '../styles/IdeaList.css'; // Import a CSS file for custom styles

const IdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);
  const [userVotes, setUserVotes] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null); // Track which idea ID is being hovered over
  const userId = 123; // Replace with actual user ID

  // Function to fetch ideas and user votes from backend
  const fetchData = async () => {
    const ideas = await fetchIdeas();
    const votes = await fetchUserVotes();

    // Map votes to ideas to calculate the total votes for each idea
    const ideasWithVotes = ideas.map((idea) => {
      const votesForIdea = votes.filter((vote) => vote.idea_id === idea.id);
      return {
        ...idea,
        votes: votesForIdea.length, // Set votes count for each idea
      };
    });

    // Sort ideas based on the number of votes (descending order)
    const sortedIdeas = ideasWithVotes.sort((a, b) => b.votes - a.votes);

    setIdeaList(sortedIdeas);
    setUserVotes(new Set(votes.map((vote) => vote.idea_id)));
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

  // Determine if there's a tie for the most votes
  const highestVotes = ideaList.length > 0 ? ideaList[0].votes : 0;
  const tiedIdeas = ideaList.filter((idea) => idea.votes === highestVotes);

  return (
    <div className="idea-container p-4 bg-black rounded-md shadow-md font-bold">
      <AddIdeaForm onAddIdea={handleAddNewIdea} />

      <ul>
        {ideaList.map((idea, index) => {
          const isMostPopular = idea.votes > 0 && (index === 0 || tiedIdeas.includes(idea));
          return (
            <li
              key={idea.id}
              className="idea-card shadow-sm pl-2 mb-2 flex justify-between items-center"
              onMouseEnter={() => setHoveredId(idea.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isMostPopular ? 'linear-gradient(to right, #8EE700, #43DDE6)' : 'white',
                position: 'relative', // Make the position relative for absolute positioning of the label
              }}
            >
              {isMostPopular && ( // Render "Most Popular!" label if this is the most voted idea
                <div
                  className="most-popular-label text-xs px-2 py-1 mb-2 absolute top-0 left-0 text-black"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    animation: 'fireAnimation 1s infinite alternate',
                  }}
                >
                  Most Popular!
                </div>
              )}
              <span className="text-lg text-gray-800" style={{ flex: '1' }}>{idea.text}</span>
              <div className="vote-section flex items-center">
                <span className="text-sm text-gray-600 mr-2" style={{ whiteSpace: 'nowrap' }}>Votes: {idea.votes}</span>
                {hasVoted(userVotes, idea.id) ? (
                  hoveredId === idea.id ? (
                    <button
                      className="bg-red-500 text-white"
                      style={{ padding: '20% 0', width: '80px' }}
                      onClick={() => handleUnvoteForIdea(idea.id)}
                    >
                      Unvote?
                    </button>
                  ) : (
                    <button
                      className="items-center bg-green-500 text-white"
                      style={{ padding: '20% 0', width: '80px' }} // Adjust the percentage as needed
                    >
                      Voted
                    </button>
                  )
                ) : (
                  <button
                    className="bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
                    style={{ padding: '20% 0', width: '80px' }}
                    onClick={() => handleVoteForIdea(idea.id)}
                  >
                    Vote
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default IdeaList;
