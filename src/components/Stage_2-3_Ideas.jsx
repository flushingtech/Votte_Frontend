import React, { useState, useEffect } from "react";
import { getIdeasByEvent, submitVote, unvote, getUserVote } from "../api/API";

function Stage_2_3_Ideas({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteError, setVoteError] = useState("");

  const userEmail = localStorage.getItem("userEmail");
  const voteType = "Most Impactful";

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas.filter((idea) => idea.stage === 2));
      } catch (err) {
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserVote = async () => {
      try {
        const userVoteData = await getUserVote(userEmail, eventId, voteType);
        setUserVote(userVoteData);
      } catch (err) {}
    };

    fetchIdeas();
    fetchUserVote();
  }, [eventId, voteType, userEmail]);

  const handleVoteClick = async (ideaId) => {
    if (!userEmail) {
      setVoteError("User email not found.");
      return;
    }

    setVoting(true);
    setVoteError("");

    try {
      if (userVote === ideaId) {
        await unvote(userEmail, ideaId, eventId, voteType);
        setUserVote(null);
      } else {
        await submitVote(ideaId, userEmail, eventId, voteType);
        setUserVote(ideaId);
      }
    } catch (err) {
      setVoteError("Failed to process vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div
      className="max-w-3xl mx-auto mt-3 p-3 border border-white relative flex flex-col"
      style={{
        backgroundColor: "#1E2A3A",
        boxShadow: "0px 0px 5px 3px rgb(255, 0, 0)", // ✅ Red Glow
        height: "60vh",
        overflow: "hidden",
      }}
    >
      <h2
        className="text-lg font-bold text-red-300 mb-3"
        style={{
          textShadow: "1px 1px 3px rgba(255, 255, 255, 0.6)", // ✅ White Stroke Effect
        }}
      >
        MOST IMPACTFUL
      </h2>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {ideas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No ideas are currently in Stage 2.</p>
          </div>
        ) : (
          <ul className="flex-1 space-y-2">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex items-center justify-between p-3 border shadow transition-all"
                style={{
                  backgroundColor: userVote === idea.id ? "#000" : "#1E2A3A",
                  borderColor: "white",
                  borderWidth: "2px",
                }}
              >
                <div>
                  <h3 className="text-sm font-bold text-white">{idea.idea}</h3>
                  <p className="text-xs text-gray-300">{idea.description}</p>
                </div>
                <button
                  onClick={() => handleVoteClick(idea.id)}
                  className={`px-5 py-3 text-sm font-bold rounded transition-all ${
                    userVote === idea.id
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  style={{
                    boxShadow: "0px 4px 10px rgba(0, 255, 0, 0.5)", // ✅ Green Button Shadow
                  }}
                  disabled={voting}
                >
                  {userVote === idea.id ? "Unvote" : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {voteError && <p className="text-xs text-red-500 text-center mt-2">{voteError}</p>}
    </div>
  );
}

export default Stage_2_3_Ideas;
