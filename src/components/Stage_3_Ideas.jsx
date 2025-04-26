import { useState, useEffect } from "react";
import { getIdeasByEvent, determineWinners, getEventResults } from "../api/API";

function Stage_3_Ideas({ eventId }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        boxShadow: "0px 0px 15px 0px rgb(255, 255, 255)", // White Glow
        height: "60vh",
        overflow: "hidden",
      }}
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        {winners.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No winners have been determined yet.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            {winners.map((winner) => {
              const borderClass = categoryStyles[winner.category];

              if (winner.category === "Hackathon Winner") {
                return (
                  <div
                    key={winner.category}
                    className="p-4 border bg-white text-black"
                    style={{
                      boxShadow: "0px 0px 5px 2px rgb(255, 123, 0)", // Orange Glow for Hackathon Winner
                    }}
                  >
                    <h3 className="text-lg font-bold text-black">🏆 {winner.category}</h3>
                    <p className="text-sm font-semibold">{winner.idea_title || "Unknown"}</p>
                    <p className="text-xs text-gray-700">{winner.idea_description}</p>
                    <p className="text-xs text-gray-600">Votes: {winner.votes}</p>
                  </div>
                );
              }

              return (
                <div
                  key={winner.category}
                  className={`p-2 border ${borderClass} bg-[#1E2A3A]`}
                  style={{
                    boxShadow: "0px 0px 5px 2px rgba(255, 255, 255, 0.42)", // White Glow for other categories
                  }}
                >
                  <h3 className="text-md font-bold text-white">{winner.category} Winner</h3>
                  <p className="text-sm font-semibold text-white">{winner.idea_title || "Unknown"}</p>
                  <p className="text-xs text-gray-300">{winner.idea_description}</p>
                  <p className="text-xs text-gray-400">Votes: {winner.votes}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Stage_3_Ideas;
