import { useState, useEffect } from "react";
import { getIdeasByEvent, determineWinners, getEventResults } from "../api/API";

function Stage_3_Ideas({ eventId }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStage3Results = async () => {
      try {
        await determineWinners(eventId); // Ensure winners are determined

        // Fetch winners from the results table
        const eventWinners = await getEventResults(eventId);
        setWinners(eventWinners);
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
    "Best Overall": "border-yellow-500",
  };

  return (
    <div
      className="max-w-3xl mx-auto mt-3 p-3 border border-white bg-[#1E2A3A]"
      style={{
        boxShadow: "0px 0px 20px 3px rgb(255, 255, 255)", // White Glow Effect for Mother Container
      }}
    >
      <h2 className="text-center text-white font-bold mb-2">Stage 3: Voting Results</h2>

      {winners.length === 0 ? (
        <p className="text-center text-gray-500">No winners have been determined yet.</p>
      ) : (
        <div className="space-y-2">
          {["Most Creative", "Most Technical", "Most Impactful", "Best Overall"].map((category) => {
            const winner = winners.find((w) => w.category === category);
            const borderClass = categoryStyles[category];

            return winner ? (
              <div
                key={category}
                className={`p-2 border ${borderClass} bg-[#1E2A3A]`}
                style={{
                  boxShadow: "0px 0px 5px 2px rgba(255, 255, 255, 0.42)", // White Glow for Individual Cards
                }}
              >
                <h3 className="text-md font-bold text-white">{category} Winner</h3>
                <p className="text-sm font-semibold text-white">{winner.idea_title || "Unknown"}</p>
                <p className="text-xs text-gray-300">{winner.idea_description}</p>
                <p className="text-xs text-gray-400">Votes: {winner.votes}</p>
              </div>
            ) : (
              <div
                key={category}
                className="p-2 border border-gray-500 bg-[#1E2A3A]"
                style={{
                  boxShadow: "0px 0px 15px 2px rgba(255, 255, 255, 0.8)", // White Glow for Non-Winners Too
                }}
              >
                <h3 className="text-md font-bold text-gray-400">{category} Winner</h3>
                <p className="text-gray-500">No winner determined</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Stage_3_Ideas;
