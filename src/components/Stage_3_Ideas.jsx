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
      bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-300", icon: "🎨",
    },
    "Most Technical": {
      bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", icon: "⚡",
    },
    "Most Impactful": {
      bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-300", icon: "🚀",
    },
    "Hackathon Winner": {
      bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", icon: "🏆",
    },
  };
  const defaultStyle = { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300", icon: "🏅" };

  return (
    <div className="bg-slate-900 border border-slate-700">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">
          {showAllIdeas ? "All Ideas" : "Winners"}
        </h2>
        <button
          onClick={handleToggle}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAllIdeas ? "Show Winners" : "View All Ideas →"}
        </button>
      </div>

      {/* Content — no internal scrollbar, grows with the page */}
      <div className="p-3 sm:p-4">
        {showAllIdeas ? (
          allIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-4xl mb-3">💡</div>
              <p className="text-slate-400 text-sm">No ideas submitted</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {allIdeas.map((idea) => (
                <li
                  key={idea.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/60"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {idea.idea}
                    </h3>
                    <div className="text-xs text-slate-400 line-clamp-1 leading-tight mt-0.5">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-xs">
                        {idea.description}
                      </MarkdownWithPlugins>
                    </div>
                  </div>
                  {idea.votes !== undefined && (
                    <span className="flex-shrink-0 text-xs text-slate-400 font-semibold tabular-nums">
                      {idea.votes} votes
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/idea/${idea.id}`)}
                    className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : winners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-slate-400 text-sm">No winners determined yet</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {winners.map((winner) => {
              const style = categoryStyles[winner.category] || defaultStyle;
              return (
                <li
                  key={winner.category}
                  className={`flex items-center gap-3 p-3 border ${style.bg} ${style.border}`}
                >
                  <span className="text-xl flex-shrink-0">{style.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${style.text}`}>
                        {winner.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight truncate">
                      {winner.idea_title || "Unknown"}
                    </h4>
                    <div className="text-xs text-slate-400 line-clamp-1 leading-tight mt-0.5">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-xs">
                        {winner.idea_description || "No description"}
                      </MarkdownWithPlugins>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-400 font-semibold tabular-nums">
                    {winner.votes} votes
                  </span>
                  <button
                    onClick={() => navigate(`/idea/${winner.winning_idea_id}`)}
                    className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                  >
                    View
                  </button>
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
