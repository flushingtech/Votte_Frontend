import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIdeasByEvent, determineWinners, getEventResults } from "../api/API";

function Stage_3_Ideas({ eventId }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (loading) return <p className="text-center text-gray-500">Loading results...</p>;
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
      <div className="flex-1 flex flex-col overflow-y-auto space-y-2">
        {winners.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No winners have been determined yet.</p>
          </div>
        ) : (
          winners.map((winner) => {
            const isHackathon = winner.category === "Hackathon Winner";
            const borderClass = categoryStyles[winner.category];

            return (
              <div
                key={winner.category}
                className={`relative p-4 border ${borderClass} ${isHackathon ? "bg-white text-black" : "bg-[#1E2A3A] text-white"}`}
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
