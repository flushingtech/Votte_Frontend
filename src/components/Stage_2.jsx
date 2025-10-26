import React, { useState, useEffect } from "react";
import {
  getIdeasByEvent,
  submitVote,
  unvote,
  getUserVote,
  getEventStage,
} from "../api/API";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

const voteCategories = ["Most Creative", "Most Technical", "Most Impactful"];
const categoryColors = {
  "Most Creative": {
    bg: "from-green-600/30 to-green-800/20",
    border: "border-green-500/50",
    text: "text-green-200",
    glow: "#10b981",
  },
  "Most Technical": {
    bg: "from-purple-600/30 to-purple-800/20",
    border: "border-purple-500/50",
    text: "text-purple-200",
    glow: "#a855f7",
  },
  "Most Impactful": {
    bg: "from-red-600/30 to-red-800/20",
    border: "border-red-500/50",
    text: "text-red-200",
    glow: "#ef4444",
  },
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
  const categoryStyle = categoryColors[currentCategory];

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-4 h-[500px] flex flex-col">
      {!showThanks ? (
        <>
          {/* Category Header */}
          <div className={`bg-gradient-to-br ${categoryStyle.bg} backdrop-blur-sm rounded-lg border ${categoryStyle.border} p-4 mb-4`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${categoryStyle.text}`}>
                {currentCategory === "Most Creative" && "🎨 "}
                {currentCategory === "Most Technical" && "⚡ "}
                {currentCategory === "Most Impactful" && "🚀 "}
                {currentCategory}
              </h2>
              <div className="flex items-center gap-2">
                {voteCategories.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentStep
                        ? `bg-${categoryStyle.text.split('-')[1]}-400`
                        : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ideas List */}
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            {filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🗳️</div>
                <p className="text-gray-400">No ideas available for voting</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredIdeas.map((idea) => {
                  const isVoted = votes[currentCategory] === idea.id;
                  return (
                    <li
                      key={idea.id}
                      className={`relative p-3 rounded-lg border transition-all duration-300 ${
                        isVoted
                          ? `bg-gradient-to-br ${categoryStyle.bg} ${categoryStyle.border} shadow-lg`
                          : "bg-gradient-to-br from-slate-700/30 to-slate-800/20 border-slate-600/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white mb-1 leading-tight">
                            {idea.idea}
                          </h3>
                          <div className="text-xs text-gray-300 line-clamp-2 leading-tight">
                            <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-xs">
                              {idea.description}
                            </MarkdownWithPlugins>
                          </div>
                        </div>
                        <button
                          onClick={() => handleVoteClick(idea.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                            isVoted
                              ? "bg-red-600 hover:bg-red-700 text-white border border-red-500/50"
                              : "bg-green-600 hover:bg-green-700 text-white border border-green-500/50"
                          }`}
                          disabled={voting}
                        >
                          {isVoted ? "✗ Unvote" : "✓ Vote"}
                        </button>
                      </div>
                      {isVoted && (
                        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
                          boxShadow: `0 0 20px ${categoryStyle.glow}40`
                        }}></div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {voteError && (
            <div className="bg-red-600/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-xs text-center mb-3">
              {voteError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentStep === 0
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-400">
              {currentStep + 1} / {voteCategories.length}
            </span>
            <button
              disabled={!votes[currentCategory]}
              onClick={() => setCurrentStep(currentStep + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !votes[currentCategory]
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-3">Thanks for Voting!</h2>
          <p className="text-gray-300 text-lg mb-4">Your votes have been recorded</p>
          <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-lg px-6 py-4">
            <p className="text-blue-200 text-sm">
              Please wait for the host to reveal the results...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stage_2;