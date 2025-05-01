import { useEffect, useState } from "react";
import { getUserIdeas, getContributedIdeas } from "../api/API";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";

function MyIdeas({ email }) {
  const [ideas, setIdeas] = useState([]);
  const [contributedIdeas, setContributedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contributedLoading, setContributedLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("myIdeas"); // Track active tab
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserIdeas = async () => {
      try {
        const userIdeas = await getUserIdeas(email);
        setIdeas(userIdeas);
      } catch (err) {
        console.error("Error fetching user ideas:", err);
        setError("Failed to load your ideas");
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUserIdeas();
    }
  }, [email]);

  const fetchContributedIdeas = async () => {
    setContributedLoading(true);
    try {
      const contributed = await getContributedIdeas(email);
      setContributedIdeas(contributed);
    } catch (err) {
      console.error("Error fetching contributed ideas:", err);
      setError("Failed to load contributed ideas");
    } finally {
      setContributedLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "contributed" && contributedIdeas.length === 0) {
      fetchContributedIdeas(); // Fetch only if not already loaded
    }
  };

  const handleEventClick = (eventId) => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      console.error("Event ID is undefined for this idea.");
    }
  };

  if (loading) return <p>Loading your ideas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="my-ideas-section bg-transparent relative flex flex-col h-full">
      {/* Tab Header */}
      <div
        className="flex border shadow-md"
        style={{
          backgroundColor: "#1E2A3A",
          border: "2px solid white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          className={`flex-1 p-2 text-xl font-bold text-white ${
            activeTab === "myIdeas" ? "border-b-4 border-yellow-400" : ""
          }`}
          onClick={() => handleTabChange("myIdeas")}
        >
          My Ideas
        </button>
        <button
          className={`flex-1 p-2 text-xl font-bold text-white ${
            activeTab === "contributed" ? "border-b-4 border-yellow-400" : ""
          }`}
          onClick={() => handleTabChange("contributed")}
        >
          Contributed
        </button>
      </div>

      {/* Scrollable Ideas List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "30vh", paddingTop: "8px" }}
      >
        {activeTab === "myIdeas" ? (
          ideas.length === 0 ? (
            <div className="p-3 shadow-md border bg-white text-left">
              <h3 className="text-lg font-bold text-black">
                You haven’t submitted any ideas yet.
              </h3>
              <p className="text-gray-700 text-sm mt-2">
                Click on an event and add your ideas there.
              </p>
            </div>
          ) : (
            <IdeaList ideas={ideas} handleEventClick={handleEventClick} />
          )
        ) : contributedLoading ? (
          <p>Loading contributed ideas...</p>
        ) : contributedIdeas.length === 0 ? (
          <div className="p-3 shadow-md border bg-white text-left">
            <h3 className="text-lg font-bold text-black">
              No contributed ideas yet.
            </h3>
            <p className="text-gray-700 text-sm mt-2">
              Ideas where you're a contributor will show up here.
            </p>
          </div>
        ) : (
          <IdeaList
            ideas={contributedIdeas}
            handleEventClick={handleEventClick}
          />
        )}
      </div>
    </div>
  );
}

// Reusable Idea List Component
function IdeaList({ ideas, handleEventClick }) {
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
            onClick={() => handleEventClick(idea.event_id)}
            style={{ border: "1px solid #666", borderRadius: "4px" }}
          >
            View Event
          </button>

          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
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
              <div className="text-xs markdown">
                <Markdown>{idea.description}</Markdown>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MyIdeas;
