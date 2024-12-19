import { useState, useEffect } from 'react';
import { getIdeasByEvent } from '../api/API';

function Stage_3_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStage3Ideas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        const stage2Ideas = eventIdeas
          .filter((idea) => idea.stage === 2) // Filter Stage 2 ideas
          .sort((a, b) => b.average_score - a.average_score); // Sort by average_score descending

        setIdeas(stage2Ideas);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas.');
      } finally {
        setLoading(false);
      }
    };

    fetchStage3Ideas();
  }, [eventId]);

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-2 space-y-2 border border-white"
      style={{ backgroundColor: 'transparent', maxHeight: '60vh', overflowY: 'auto' }}
    >
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
