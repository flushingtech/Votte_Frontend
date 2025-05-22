import { useEffect, useState } from "react";
import { getContributedIdeas } from "../api/API";
import { useNavigate } from "react-router-dom";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function MyIdeas({ email }) {
  const [contributedIdeas, setContributedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContributedIdeas = async () => {
      try {
        const contributed = await getContributedIdeas(email);
        setContributedIdeas(contributed);
      } catch (err) {
        console.error("Error fetching contributed ideas:", err);
        setError("Failed to load contributed ideas");
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchContributedIdeas();
  }, [email]);

  const handleIdeaClick = (ideaId) => {
    if (ideaId) {
      navigate(`/idea/${ideaId}`);
    } else {
      console.error("Idea ID is undefined.");
    }
  };

  if (loading) return <p>Loading contributed ideas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="my-ideas-section bg-transparent relative flex flex-col h-full">
      {/* Header */}
      <div
        className="flex border shadow-md justify-center"
        style={{
          backgroundColor: "#1E2A3A",
          border: "2px solid white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span className="p-2 text-xl font-bold text-white">My Projects</span>
      </div>

      {/* Contributed Ideas */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "30vh", paddingTop: "8px" }}
      >
        {contributedIdeas.length === 0 ? (
          <div className="p-3 shadow-md border bg-white text-left">
            <h3 className="text-lg font-bold text-black">
              No contributed ideas yet.
            </h3>
            <p className="text-gray-700 text-sm mt-2">
              Ideas where you're a contributor will show up here.
            </p>
          </div>
        ) : (
          <IdeaList ideas={contributedIdeas} handleIdeaClick={handleIdeaClick} />
        )}
      </div>
    </div>
  );
}

// Reusable Idea List Component
function IdeaList({ ideas, handleIdeaClick }) {
  return (
    <ul className="space-y-1">
      {ideas.map((idea) => (
        <li
          key={idea.id}
          className="p-2 shadow-md border relative bg-white text-sm"
          style={{
            border: "2px solid #1E2A3A",
            marginBottom: "3px",
            padding: "6px",
          }}
        >
          <button
            className="absolute top-2 right-2 text-xs font-semibold bg-black text-white px-2 py-1 hover:bg-gray-800 transition-all"
            onClick={() => handleIdeaClick(idea.id)}
            style={{ border: "1px solid #666", borderRadius: "4px" }}
          >
            View Idea
          </button>

          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h3
              className="text-sm font-bold text-black"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {idea.idea}
            </h3>
            <div
              className="text-gray-700 text-xs mt-1"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              <MarkdownWithPlugins className="text-sm">
                {idea.description}
              </MarkdownWithPlugins>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MyIdeas;
