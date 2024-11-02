import { useState, useEffect } from 'react';
import { getIdeasByEvent, getVotedIdeas } from '../api/API';
import VoteButton from './VoteButton';

function IdeasList({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userEmail = localStorage.getItem('userEmail'); // Get user email from local storage
  const [userVotedIdeas, setUserVotedIdeas] = useState([]); // Track ideas user has voted for

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        // Fetch the ideas for the event
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas);
        
        // Fetch the user's voted ideas
        if (userEmail) {
          const votedIdeas = await getVotedIdeas(userEmail); // Fetch ideas user voted for
          setUserVotedIdeas(votedIdeas);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching ideas by event:', err);
        setError('Failed to load ideas');
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId, userEmail]);

  const handleVoteChange = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading ideas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="ideas-list max-w-3xl mx-auto my-4 p-5 space-y-4" style={{ backgroundColor: 'transparent' }}>
      <h2 className="text-2xl font-bold mb-2 text-white">Ideas</h2>
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas have been submitted for this event yet.</p>
      ) : (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="relative p-2 shadow hover:shadow-md transition-shadow duration-300 border"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                <p className="text-gray-400 text-xs">By: {idea.email}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="max-w-xs">
                  <p className="text-gray-100 mt-0">{idea.description}</p>
                  <p className="text-sm text-gray-300">Tech Magic: {idea.technologies}</p>
                </div>
                <p className="text-sm text-gray-300 leading-loose">Votes: {idea.votes}</p>
              </div>
              <VoteButton
                ideaId={idea.id}
                currentUserEmail={userEmail}
                initialVotes={idea.votes}
                hasVoted={userVotedIdeas.includes(idea.id)} // Check if user has voted for this idea
                onVoteChange={handleVoteChange} // Callback to update votes in IdeasList
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IdeasList;
