import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIdeasByEvent, getLikedIdeas, deleteIdea } from "../api/API";
import LikeButton from "./LikeButton";
import EditIdea from "./EditIdea";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function Stage_1_Ideas({ eventId, refreshIdeas }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [userLikedIdeas, setUserLikedIdeas] = useState([]);
  const userEmail = localStorage.getItem("userEmail") || null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const eventIdeas = await getIdeasByEvent(eventId);

        if (userEmail) {
          const likedIdeas = await getLikedIdeas(userEmail);
          setUserLikedIdeas(likedIdeas);
        }

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
    if (window.confirm("Are you sure you want to delete this idea?")) {
      try {
        await deleteIdea(ideaId, userEmail);
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
        if (refreshIdeas) refreshIdeas();
      } catch (err) {
        console.error("Error deleting idea:", err);
        alert("Failed to delete idea.");
      }
    }
  };

  const handleEditSuccess = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
    setEditingIdea(null);
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const maxLikes = Math.max(...ideas.map((idea) => idea.likes), 0);

  return (
    <>
      <style>
        {`
          .glowing-border {
            border: 2px solid white;
            box-shadow: 0 0 2px white, 0 0 4px white, 0 0 6px white;
            animation: glowing 1.5s infinite;
          }

          .blue-yellow-glow {
            border: 2px solid blue;
            box-shadow: 0 0 10px blue, 0 0 20px yellow, 0 0 30px blue;
            animation: blue-yellow-glow 2s infinite;
          }

          .idea-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
          }

          .content-section {
            width: calc(100% - 120px);
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
            border-radius: 1px;
            font-weight: bold;
            font-size: 10px;
            display: inline-block;
            margin-bottom: 2px;
          }

          .likes-count {
            font-size: 10px;
            color: white;
          }

          .most-popular-container {
            background: linear-gradient(90deg, red, yellow, green, blue, purple);
            background-size: 400% 400%;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 3px;
            border-radius: 1px;
            margin-bottom: 5px;
            animation: pulse-colors 3s ease infinite;
          }

          @keyframes pulse-colors {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .menu-button {
            position: absolute;
            top: 55px;
            right: 5px;
            font-size: 18px;
            cursor: pointer;
            color: white;
            background: none;
            border: none;
            z-index: 10;
          }

          .menu-button:hover {
            color: #ccc;
          }

          .dropdown-menu {
            position: absolute;
            top: -5px;
            right: 5px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 20;
            width: 70px;
            padding: 5px 0;
            text-align: center;
          }

          .dropdown-menu button {
            width: 100%;
            padding: 6px 0;
            text-align: center;
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

          .most-popular-like-wrapper {
            position: relative;
          }

          .most-popular-container {
            text-align: center;
            margin-bottom: 5px;
          }

          .like-button-wrapper {
            position: absolute;
            right: 5px;
            bottom: -30px;
          }
        `}
      </style>

      <div
        className="ideas-list max-w-3xl mx-auto mt-3 p-3 space-y-2 border border-white"
        style={{
          backgroundColor: "transparent",
          height: "60vh", // <-- always 65% of viewport
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {ideas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">
              No ideas have been submitted yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ideas.map((idea) => {
              const isMostPopular = idea.likes === maxLikes;
              const isYourIdea = idea.email === userEmail;

              return (
                <li
                  key={idea.id}
                  className={`relative p-2 shadow ${
                    isYourIdea
                      ? "glowing-border"
                      : isMostPopular
                      ? "blue-yellow-glow"
                      : "border-gray-500"
                  }`}
                  style={{
                    backgroundColor: "#1E2A3A",
                  }}
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

                    {isYourIdea && (
                      <div className="your-idea-section">
                        <div className="your-idea-container">Your Idea</div>
                        {isMostPopular && (
                          <div className="most-popular-container">
                            Most Popular
                          </div>
                        )}
                        <div className="likes-count">{idea.likes} Likes</div>
                        <div
                          className="menu-button"
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === idea.id ? null : idea.id
                            )
                          }
                        >
                          ...
                        </div>
                        {menuOpenId === idea.id && (
                          <div className="dropdown-menu">
                            <button onClick={() => setEditingIdea(idea)}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(idea.id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!isYourIdea && (
                      <div className="most-popular-like-wrapper">
                        {isMostPopular && (
                          <div className="most-popular-container">
                            Most Popular
                          </div>
                        )}
                        <div className="like-button-wrapper">
                          <LikeButton
                            ideaId={idea.id}
                            currentUserEmail={userEmail}
                            initialLikes={idea.likes}
                            hasLiked={userLikedIdeas.includes(idea.id)}
                            onLikeChange={(updatedIdea) =>
                              setIdeas((prevIdeas) =>
                                prevIdeas.map((i) =>
                                  i.id === updatedIdea.id ? updatedIdea : i
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {editingIdea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <EditIdea
              ideaData={editingIdea}
              onEditSuccess={handleEditSuccess}
            />
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
