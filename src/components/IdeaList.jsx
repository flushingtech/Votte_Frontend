import React, { useState, useEffect } from 'react';

const IdeaList = () => {
  const [ideaList, setIdeaList] = useState([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [userVotes, setUserVotes] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null); // Track which idea ID is being hovered over
  const userId = 123; // Replace with actual user ID

  // Fetch ideas and user votes from backend on component mount
  useEffect(() => {
    fetchIdeas();
    fetchUserVotes();
  }, []); // Empty dependency array to run once on mount

  const fetchIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3000/ideas');
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const ideas = await response.json();
      setIdeaList(ideas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/votes'); // Replace with appropriate endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch user votes');
      }
      const votes = await response.json();
      const userVoteSet = new Set(votes.map((vote) => vote.idea_id));
      setUserVotes(userVoteSet);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleAddIdea = async () => {
    if (newIdeaText.trim() !== '') {
      try {
        const response = await fetch('http://localhost:3000/ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newIdeaText }),
        });
        if (!response.ok) {
          throw new Error('Failed to add idea');
        }
        // Refresh idea list after adding new idea
        fetchIdeas();
        setNewIdeaText('');
      } catch (error) {
        console.error('Error adding idea:', error);
      }
    }
  };

  const handleVote = async (id) => {
    console.log('User ID:', userId); // Log user ID before voting
    try {
      const response = await fetch(`http://localhost:3000/ideas/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // Pass userId to the backend
      });
      if (!response.ok) {
        throw new Error('Failed to vote for idea');
      }
      // After successful vote, fetch updated idea list
      await fetchIdeas();
      // Refresh user votes after voting
      await fetchUserVotes();
    } catch (error) {
      console.error('Error voting for idea:', error);
    }
  };

  const handleUnvote = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/ideas/${id}/vote`, {
        method: 'DELETE', // Use DELETE method to remove vote
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // Pass userId to the backend for unvoting
      });
      if (!response.ok) {
        throw new Error('Failed to unvote for idea');
      }
      // After successful unvote, fetch updated idea list
      await fetchIdeas();
      // Refresh user votes after unvoting
      await fetchUserVotes();
    } catch (error) {
      console.error('Error unvoting for idea:', error);
    }
  };

  const hasVoted = (id) => userVotes.has(id);

  return (
    <div className="idea-container p-4 bg-black rounded-md shadow-md text-center">
      <div className="add-idea mb-4 flex items-center justify-center">
        <input
          type="text"
          value={newIdeaText}
          onChange={(e) => setNewIdeaText(e.target.value)}
          className="p-2 border rounded-md mr-2 text-black focus:outline-none"
          placeholder="Enter new idea..."
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
          onClick={handleAddIdea}
        >
          Add an Idea
        </button>
      </div>
      <ul>
        {ideaList.map((idea) => (
          <li
            key={idea.id}
            className="bg-white rounded-md shadow-sm p-4 mb-4 flex justify-between items-center"
            onMouseEnter={() => setHoveredId(idea.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="text-lg text-gray-800">{idea.text}</span>
            <div className="vote-section flex items-center">
              <span className="text-sm text-gray-600 mr-2">Votes: {idea.votes}</span>
              {hasVoted(idea.id) ? (
                hoveredId === idea.id ? (
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-md"
                    onClick={() => handleUnvote(idea.id)}
                  >
                    Unvote?
                  </button>
                ) : (
                  <button className="px-3 py-1 bg-green-500 text-white rounded-md">
                    Voted!
                  </button>
                )
              ) : (
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
                  onClick={() => handleVote(idea.id)}
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
