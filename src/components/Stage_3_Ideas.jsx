import { useState, useEffect } from 'react';
import { getIdeasByEvent, determineWinners, getEventResults } from '../api/API';

function Stage_3_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStage3Ideas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        const stage2Ideas = eventIdeas
          .filter((idea) => idea.stage === 2) // Filter Stage 2 ideas
          .sort((a, b) => b.average_score - a.average_score); // Sort by highest score

        setIdeas(stage2Ideas);

        // Trigger the backend to determine winners if Stage 3.1 is active
        await determineWinners(eventId);

        // Fetch winners from the results table
        const eventWinners = await getEventResults(eventId);
        setWinners(eventWinners);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load ideas and results.');
      } finally {
        setLoading(false);
      }
    };

    fetchStage3Ideas();
  }, [eventId]);

  if (loading) return <p className="text-center text-gray-500">Loading ideas and results...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-2 space-y-2 border border-white"
      style={{ backgroundColor: 'transparent', maxHeight: '60vh', overflowY: 'auto' }}
    >
      <h2 className="text-center text-white font-bold">Stage 3: Voting Results</h2>

      {winners.length === 0 ? (
        <p className="text-center text-gray-500">No winners have been determined yet.</p>
      ) : (
        <div className="space-y-4">
          {['Most Creative', 'Most Technical', 'Most Impactful'].map((category) => {
            const winner = winners.find((w) => w.category === category);
            return winner ? (
              <div key={category} className="p-3 border border-green-500 bg-[#1E2A3A]">
                <h3 className="text-md font-bold text-green-400">{category} Winner</h3>
                <p className="text-white font-semibold">{winner.idea_title || 'Unknown'}</p>
                <p className="text-xs text-gray-300">{winner.idea_description}</p>
                <p className="text-xs text-gray-300">Votes: {winner.votes}</p>
              </div>
            ) : (
              <div key={category} className="p-3 border border-gray-500 bg-[#1E2A3A]">
                <h3 className="text-md font-bold text-gray-400">{category} Winner</h3>
                <p className="text-gray-500">No winner determined</p>
              </div>
            );
          })}
        </div>
      )}


      <h3 className="text-white font-bold mt-4">All Stage 2 Ideas</h3>
      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea, index) => (
            <li
              key={idea.id}
              className="p-2 shadow border border-yellow-500"
              style={{ backgroundColor: '#1E2A3A' }}
            >
              <h3 className="text-sm font-bold text-white">
                #{index + 1}: {idea.idea}
              </h3>
              <p className="text-xs text-gray-300 mt-1">{idea.description}</p>
              <p className="text-xs text-yellow-400 font-bold mt-1">
                Score: {parseFloat(idea.average_score).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Stage_3_Ideas;
