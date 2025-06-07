import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getIdeasByEvent,
  determineWinners,
  getEventResults,
} from "../api/API";

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
    "Most Creative": "border-green-500",
    "Most Technical": "border-purple-500",
    "Most Impactful": "border-red-500",
    "Hackathon Winner": "border-yellow-500",
  };

  return (
    <div
      className="max-w-3xl mx-auto mt-3 p-3 border border-white bg-[#1E2A3A] flex flex-col relative"
      style={{
        boxShadow: "0px 0px 15px 0px rgb(255, 255, 255)",
        height: "60vh",
        overflow: "hidden",
      }}
    >
      <div className="mb-2 text-right">
        <button
          onClick={handleToggle}
          className="text-xs font-semibold px-3 py-1 border border-white text-white hover:bg-white hover:text-black transition"
        >
          {showAllIdeas ? "Show Winners" : "View All Ideas"}
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto space-y-2">
        {showAllIdeas ? (
          allIdeas.length === 0 ? (
            <p className="text-gray-500 text-center">No ideas submitted.</p>
          ) : (
            allIdeas.map((idea) => (
              <div
                key={idea.id}
                className="relative p-4 border border-white text-white bg-[#121C2B]"
              >
                <button
                  onClick={() => navigate(`/idea/${idea.id}`)}
                  className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 border rounded bg-white text-black hover:bg-gray-200 transition"
                >
                  View Idea
                </button>
                <h3 className="text-md font-bold">{idea.idea}</h3>
                <p className="text-sm">{idea.description}</p>
                <p className="text-xs text-gray-400">Votes: {idea.votes}</p>
              </div>
            ))
          )
        ) : winners.length === 0 ? (
          <p className="text-gray-500 text-center">No winners determined yet.</p>
        ) : (
          winners.map((winner) => {
            const isHackathon = winner.category === "Hackathon Winner";
            const borderClass = categoryStyles[winner.category];
            return (
              <div
                key={winner.category}
                className={`relative p-4 border ${borderClass} ${
                  isHackathon ? "bg-white text-black" : "bg-[#1E2A3A] text-white"
                }`}
                style={{
                  boxShadow: isHackathon
                    ? "0px 0px 5px 2px rgb(255, 123, 0)"
                    : "0px 0px 5px 2px rgba(255, 255, 255, 0.42)",
                }}
              >
                <button
                  onClick={() => navigate(`/idea/${winner.winning_idea_id}`)}
                  className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 border rounded ${
                    isHackathon
                      ? "bg-black text-white hover:bg-gray-900"
                      : "bg-white text-black hover:bg-gray-200"
                  } transition`}
                >
                  View Idea
                </button>
                <h3 className="text-md font-bold">
                  {isHackathon ? "🏆 " : ""}
                  {winner.category} Winner
                </h3>
                <p className="text-sm font-semibold">
                  {winner.idea_title || "Unknown"}
                </p>
                <p className="text-xs text-gray-300">{winner.idea_description}</p>
                <p className="text-xs text-gray-400">Votes: {winner.votes}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Stage_3_Ideas;
