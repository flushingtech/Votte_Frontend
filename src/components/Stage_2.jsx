import React, { useState, useEffect } from "react";
import {
  getIdeasByEvent,
  submitVote,
  unvote,
  getUserVote,
  getEventStage,
} from "../api/API";

const voteCategories = ["Most Creative", "Most Technical", "Most Impactful"];
const categoryColors = {
  "Most Creative": "rgb(0, 255, 0)",      // Green
  "Most Technical": "rgb(246, 63, 246)",  // Purple
  "Most Impactful": "rgb(255, 0, 0)",     // Red
};

function Stage_2({ eventId }) {
  const [ideas, setIdeas] = useState([]);
  const [votes, setVotes] = useState({});
  const [voting, setVoting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voteError, setVoteError] = useState("");
  const [stage, setStage] = useState(2);

  const userEmail = localStorage.getItem("userEmail");
  const currentCategory = voteCategories[currentStep];

  useEffect(() => {
    const loadIdeasAndVotes = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        setIdeas(eventIdeas.filter((idea) => idea.stage === 2));

        const fetchedVotes = {};
        for (const category of voteCategories) {
          try {
            const userVote = await getUserVote(userEmail, eventId, category);
            fetchedVotes[category] = userVote;
          } catch {
            fetchedVotes[category] = null;
          }
        }
        setVotes(fetchedVotes);
      } catch (err) {
        console.error("Error loading voting data", err);
      } finally {
        setLoading(false);
      }
    };

    loadIdeasAndVotes();

    // Auto-refresh on Stage 3
    const interval = setInterval(async () => {
      const newStage = await getEventStage(eventId);
      if (newStage >= 3) window.location.reload();
      else setStage(newStage);
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId, userEmail]);

  const handleVoteClick = async (ideaId) => {
    setVoting(true);
    setVoteError("");

    try {
      if (votes[currentCategory] === ideaId) {
        await unvote(userEmail, ideaId, eventId, currentCategory);
        setVotes((prev) => ({ ...prev, [currentCategory]: null }));
      } else {
        await submitVote(ideaId, userEmail, eventId, currentCategory);
        setVotes((prev) => ({ ...prev, [currentCategory]: ideaId }));
      }
    } catch (err) {
      setVoteError("Failed to submit vote. Try again.");
    } finally {
      setVoting(false);
    }
  };

  const showThanks = currentStep >= voteCategories.length;
  const filteredIdeas = ideas.filter((idea) => idea.stage === 2);
  const glow = categoryColors[currentCategory] || "white";

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;

  return (
    <div
      className="max-w-3xl mx-auto mt-3 p-4 border border-white bg-[#1E2A3A] relative"
      style={{
        boxShadow: `0px 0px 5px 3px ${glow}`,
        height: "70vh",
        overflowY: "auto",
      }}
    >
      {!showThanks ? (
        <>
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            {currentCategory.toUpperCase()}
          </h2>

          {filteredIdeas.length === 0 ? (
            <p className="text-gray-500 text-center">No ideas in Stage 2.</p>
          ) : (
            <ul className="space-y-3">
              {filteredIdeas.map((idea) => (
                <li
                  key={idea.id}
                  className="flex items-center justify-between p-3 border border-white shadow"
                  style={{
                    backgroundColor: votes[currentCategory] === idea.id ? "#000" : "#1E2A3A",
                  }}
                >
                  <div>
                    <h3 className="text-white text-sm font-bold">{idea.idea}</h3>
                    <p className="text-gray-300 text-xs">{idea.description}</p>
                  </div>
                  <button
                    onClick={() => handleVoteClick(idea.id)}
                    className={`px-4 py-2 rounded text-sm font-bold ${
                      votes[currentCategory] === idea.id
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                    disabled={voting}
                    style={{ boxShadow: "0px 4px 10px rgba(0, 255, 0, 0.5)" }}
                  >
                    {votes[currentCategory] === idea.id ? "Unvote" : "Vote"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {voteError && (
            <p className="text-xs text-red-500 text-center mt-2">{voteError}</p>
          )}

          <div className="flex justify-between mt-5">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-white underline"
            >
              Back
            </button>
            <button
              disabled={!votes[currentCategory]}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="text-white underline"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-white mt-10">
          <h2 className="text-2xl font-bold mb-3">Thanks for voting!</h2>
          <p>Please wait for the host to reveal results...</p>
        </div>
      )}
    </div>
  );
}

export default Stage_2;