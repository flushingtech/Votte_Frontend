import { useState, useEffect } from "react";
import { getIdeasByEvent, submitMostCreativeVote, getMostCreativeIdea } from "../api/API";

function MostCreativeVoting({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [mostCreativeIdea, setMostCreativeIdea] = useState(null);
  const [voteError, setVoteError] = useState("");

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        const stage2Ideas = eventIdeas.filter((idea) => idea.stage === 2); // Only Stage 2 ideas
        setIdeas(stage2Ideas);

        // Fetch Most Creative idea (if already voted)
        const mostCreative = await getMostCreativeIdea(eventId);
        if (mostCreative) setMostCreativeIdea(mostCreative);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId]);

  const handleVote = async () => {
    if (!selectedIdeaId) {
      setVoteError("Please select an idea before submitting.");
      return;
    }

    try {
      await submitMostCreativeVote(userEmail, selectedIdeaId, eventId);
      setMostCreativeIdea(selectedIdeaId);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setVoteError("Failed to submit vote. Please try again.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white"
      style={{ backgroundColor: "transparent", maxHeight: "60vh", overflowY: "auto" }}
    >
      <h2 className="text-xl font-bold text-white text-center mb-3">Vote for the Most Creative Idea</h2>

      {ideas.length === 0 ? (
        <p className="text-center text-gray-500">No ideas are currently in Stage 2.</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className={`relative p-2 border ${
                selectedIdeaId === idea.id ? "border-yellow-500" : "border-gray-500"
              } shadow`}
              style={{ backgroundColor: "#1E2A3A", cursor: "pointer" }}
              onClick={() => setSelectedIdeaId(idea.id)}
            >
              <h3 className="text-sm font-bold text-white">{idea.idea}</h3>
              <p className="text-xs text-gray-300 mt-1">{idea.description}</p>
            </li>
          ))}
        </ul>
      )}

      {mostCreativeIdea ? (
        <p className="text-center text-green-500 mt-3">Your vote has been recorded!</p>
      ) : (
        <button
          onClick={handleVote}
          className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 mt-3"
        >
          Submit Vote
        </button>
      )}

      {voteError && <p className="text-xs text-red-500 text-center">{voteError}</p>}
    </div>
  );
}

export default MostCreativeVoting;
