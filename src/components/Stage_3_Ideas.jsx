import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getIdeasByEvent,
  determineWinners,
  getEventResults,
} from "../api/API";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function Stage_3_Ideas({ eventId }) {
  const [winners, setWinners] = useState([]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStage3Results = async () => {
      try {
        await determineWinners(eventId);
        const eventWinners = await getEventResults(eventId);
        const sortedWinners = eventWinners.sort((a, b) => {
          if (a.category === "Hackathon Winner") return -1;
          if (b.category === "Hackathon Winner") return 1;
          return 0;
        });
        setWinners(sortedWinners);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchStage3Results();
  }, [eventId]);

  const handleToggle = async () => {
    if (!showAllIdeas && allIdeas.length === 0) {
      try {
        setLoading(true);
        const ideas = await getIdeasByEvent(eventId);
        setAllIdeas(ideas);
      } catch (err) {
        console.error("Error fetching all ideas:", err);
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    }
    setShowAllIdeas((prev) => !prev);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const categoryStyles = {
    "Most Creative": {
      bg: "from-green-600/30 to-green-800/20",
      border: "border-green-500/50",
      text: "text-green-200",
      icon: "🎨",
    },
    "Most Technical": {
      bg: "from-purple-600/30 to-purple-800/20",
      border: "border-purple-500/50",
      text: "text-purple-200",
      icon: "⚡",
    },
    "Most Impactful": {
      bg: "from-red-600/30 to-red-800/20",
      border: "border-red-500/50",
      text: "text-red-200",
      icon: "🚀",
    },
    "Hackathon Winner": {
      bg: "from-yellow-600/30 to-yellow-800/20",
      border: "border-yellow-500/50",
      text: "text-yellow-200",
      icon: "🏆",
    },
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-4 h-[500px] flex flex-col">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          {showAllIdeas ? "📋 All Ideas" : "🎉 Winners"}
        </h2>
        <button
          onClick={handleToggle}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {showAllIdeas ? "🏆 Show Winners" : "📋 View All Ideas"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        {showAllIdeas ? (
          allIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">💡</div>
              <p className="text-gray-400">No ideas submitted</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {allIdeas.map((idea) => (
                <li
                  key={idea.id}
                  className="relative p-2 rounded-md border bg-gradient-to-br from-slate-700/30 to-slate-800/20 border-slate-600/50 transition-all duration-300 hover:scale-[1.01]"
                >
                  <button
                    onClick={() => navigate(`/idea/${idea.id}`)}
                    className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-medium px-2 py-1 rounded hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    👁️ View
                  </button>
                  <div className="pr-16">
                    <h3 className="text-sm font-bold text-white leading-tight mb-0.5">
                      {idea.idea}
                    </h3>
                    <div className="text-[10px] text-gray-300 line-clamp-1 leading-tight mb-1">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-[10px]">
                        {idea.description}
                      </MarkdownWithPlugins>
                    </div>
                    {idea.votes !== undefined && (
                      <span className="text-[10px] text-gray-400">
                        👍 {idea.votes}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : winners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-400">No winners determined yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {winners.map((winner) => {
              const isHackathon = winner.category === "Hackathon Winner";
              const style = categoryStyles[winner.category];
              return (
                <li
                  key={winner.category}
                  className={`relative p-3 rounded-lg border bg-gradient-to-br ${style.bg} ${style.border} transition-all duration-300 hover:scale-[1.01] shadow-xl`}
                  style={{
                    boxShadow: isHackathon
                      ? "0 0 30px rgba(234, 179, 8, 0.4)"
                      : "0 0 20px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <button
                    onClick={() => navigate(`/idea/${winner.winning_idea_id}`)}
                    className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-medium px-2 py-1 rounded hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    👁️ View
                  </button>
                  <div className="pr-16">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{style.icon}</span>
                      <h3 className={`text-sm font-bold ${style.text}`}>
                        {winner.category}
                      </h3>
                    </div>
                    <h4 className="text-base font-bold text-white mb-0.5 leading-tight">
                      {winner.idea_title || "Unknown"}
                    </h4>
                    <div className="text-[10px] text-gray-300 line-clamp-1 leading-tight mb-1">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-[10px]">
                        {winner.idea_description || "No description"}
                      </MarkdownWithPlugins>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      👍 {winner.votes} votes
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Stage_3_Ideas;
