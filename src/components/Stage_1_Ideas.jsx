import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIdeasByEvent, getLikedIdeas, deleteIdea } from "../api/API";
import EditIdea from "./EditIdea";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function Stage_1_Ideas({ eventId, refreshIdeas, isAdmin })  {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const userEmail = localStorage.getItem("userEmail") || null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);
        const sortedIdeas = eventIdeas.sort((a, b) => {
          if (a.email === userEmail && b.email !== userEmail) return -1;
          if (a.email !== userEmail && b.email === userEmail) return 1;
          return b.likes - a.likes;
        });
        setIdeas(sortedIdeas);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [eventId, userEmail]);

  const handleDelete = async (ideaId) => {
    if (window.confirm("Are you sure you want to remove this idea from this event?")) {
      try {
        await deleteIdea(ideaId, eventId, userEmail);
        setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
        if (refreshIdeas) refreshIdeas();
      } catch (err) {
        console.error("Error deleting idea:", err);
        alert("Failed to delete idea.");
      }
    }
  };

  const handleEditSuccess = (updatedIdea) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
    setEditingIdea(null);
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <style>
        {`
          .glowing-border {
            border: 2px solid white;
            box-shadow: 0 0 2px white, 0 0 4px white;
          }

          .idea-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
          }

          .content-section {
            width: calc(100% - 100px);
          }

          .your-idea-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            position: absolute;
            top: 0px;
            right: 0px;
            width: 100px;
          }

          .your-idea-container {
            background-color: white;
            color: black;
            padding: 2px 5px;
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 4px;
            border-radius: 1px;
          }

          .menu-button {
            position: absolute;
            top: 45px;
            right: 5px;
            font-size: 18px;
            cursor: pointer;
            color: white;
            background: none;
            border: none;
            z-index: 10;
          }

          .dropdown-menu {
            position: absolute;
            top: -5px;
            right: 5px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 70px;
            padding: 5px 0;
            z-index: 20;
            text-align: center;
          }

          .dropdown-menu button {
            width: 100%;
            padding: 6px 0;
            border: none;
            background: none;
            font-size: 12px;
            color: #333;
            cursor: pointer;
          }

          .dropdown-menu button:hover {
            background-color: #f5f5f5;
            color: #000;
          }
        `}
      </style>

      <div
        className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white"
        style={{
          backgroundColor: "transparent",
          height: "60vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {ideas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">No ideas have been submitted yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ideas.map((idea) => {
              const isYourIdea = idea.email === userEmail;

              return (
                <li
                  key={idea.id}
                  className={`relative p-2 shadow ${
                    isYourIdea ? "glowing-border" : "border-gray-500"
                  }`}
                  style={{ backgroundColor: "#1E2A3A" }}
                >
                  <div className="idea-container">
                    <div className="content-section">
                      <h3
                        className="text-sm font-bold text-white cursor-pointer"
                        onClick={() => navigate(`/idea/${idea.id}`)}
                      >
                        {idea.idea}
                      </h3>
                      <div className="text-sm text-gray-100 mt-1">
                        <MarkdownWithPlugins className="prose prose-invert prose-sm">
                          {idea.description}
                        </MarkdownWithPlugins>
                      </div>
                      <p className="text-xs text-gray-300">
                        Tech Magic: {idea.technologies}
                      </p>
                    </div>

                    <div className="your-idea-section">
                      {isYourIdea && <div className="your-idea-container">Your Idea</div>}

                      <button
                        className="font-semibold bg-black text-white px-2 py-1 hover:bg-gray-800 transition-all"
                        onClick={() => navigate(`/idea/${idea.id}`)}
                        style={{ fontSize: "10px", border: "1px solid #666", borderRadius: "2px" }}
                      >
                        View More
                      </button>

                      {(isYourIdea || isAdmin) && (
                        <>
                          <div
                            className="menu-button"
                            onClick={() =>
                              setMenuOpenId(menuOpenId === idea.id ? null : idea.id)
                            }
                          >
                            ...
                          </div>
                          {menuOpenId === idea.id && (
                            <div className="dropdown-menu">
                              {isYourIdea && <button onClick={() => setEditingIdea(idea)}>Edit</button>}
                              <button onClick={() => handleDelete(idea.id)}>Delete</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {editingIdea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <EditIdea ideaData={editingIdea} onEditSuccess={handleEditSuccess} />
            <button
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setEditingIdea(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Stage_1_Ideas;
