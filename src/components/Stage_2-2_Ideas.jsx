import React, { useState, useEffect } from "react";
import { getIdeasByEvent, submitVote, unvote, getUserVote } from "../api/API";

function Stage_2_2_Ideas({ eventId }) {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [voting, setVoting] = useState(false);
    const [userVote, setUserVote] = useState(null);
    const [voteError, setVoteError] = useState("");

    const userEmail = localStorage.getItem("userEmail");
    const voteType = "Most Technical"; // ✅ Set to "Most Technical"

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
            } catch (err) { }
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
            className="max-w-3xl mx-auto mt-3 p-3 border border-white relative"
            style={{
                backgroundColor: "#1E2A3A",
                boxShadow: "0px 0px 5px 3px rgb(246, 63, 246)", // ✅ Purple Glow Effect
            }}
        >
            <h2
                className="text-lg font-bold text-purple-300 mb-3"
                style={{
                    textShadow: "1px 1px 3px rgba(255, 255, 255, 0.6)", // ✅ White Stroke Effect
                }}
            >
                MOST TECHNICAL
            </h2>

            {ideas.length === 0 ? (
                <p className="text-gray-500">No ideas are currently in Stage 2.</p>
            ) : (
                <ul className="space-y-2">
                    {ideas.map((idea) => (
                        <li
                            key={idea.id}
                            className="flex items-center justify-between p-3 border shadow transition-all"
                            style={{
                                backgroundColor: userVote === idea.id ? "#000" : "#1E2A3A", // ✅ Black Background if Voted
                                borderColor: "white",
                                borderWidth: "2px",
                            }}
                        >
                            <div>
                                <h3 className={`text-sm font-bold ${userVote === idea.id ? "text-white" : "text-white"}`}>
                                    {idea.idea}
                                </h3>
                                <p className={`text-xs ${userVote === idea.id ? "text-gray-400" : "text-gray-300"}`}>
                                    {idea.description}
                                    <p className="text-xs text-gray-400 mt-1">
                                        By: {idea.contributors && idea.contributors.trim()
                                            ? idea.contributors.split(',').map((c, index) => (
                                                <span key={index} className="text-blue-400">
                                                    {c.trim().slice(0, 6)}
                                                    {index !== idea.contributors.split(',').length - 1 && ", "}
                                                </span>
                                            ))
                                            : "N/A"}
                                    </p>

                                </p>
                            </div>
                            <button
                                onClick={() => handleVoteClick(idea.id)}
                                className={`px-5 py-3 text-sm font-bold rounded transition-all ${userVote === idea.id
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
            {voteError && <p className="text-xs text-red-500 text-center">{voteError}</p>}
        </div>
    );
}

export default Stage_2_2_Ideas;
