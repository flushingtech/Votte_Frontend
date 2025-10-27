import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getIdeasByEvent, deleteIdea } from "../api/API";
import EditIdea from "./EditIdea";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function Stage_1_Ideas({ eventId, refreshIdeas, isAdmin }) {
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
        const sortedIdeas = (eventIdeas || []).sort((a, b) => {
          const aIsYours = a?.email === userEmail;
          const bIsYours = b?.email === userEmail;
          if (aIsYours && !bIsYours) return -1;
          if (!aIsYours && bIsYours) return 1;
          const aLikes = typeof a?.likes === "number" ? a.likes : 0;
          const bLikes = typeof b?.likes === "number" ? b.likes : 0;
          return bLikes - aLikes;
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
    setIdeas((prev) => prev.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
    setEditingIdea(null);
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-1.5 sm:p-2 h-[500px] overflow-y-auto">
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">💡</div>
          <h3 className="text-base sm:text-xl font-semibold text-white mb-1 sm:mb-2">No Ideas Yet</h3>
          <p className="text-sm sm:text-base text-gray-400">Be the first to share your innovative concept!</p>
        </div>
      ) : (
        <ul className="space-y-1 sm:space-y-1.5">
          {ideas.map((idea) => {
            const isYourIdea = idea?.email === userEmail;
            const techLabel = Array.isArray(idea?.technologies)
              ? idea.technologies.join(", ")
              : (idea?.technologies ?? "No tech listed");

            return (
              <li
                key={idea.id}
                className={`relative p-1.5 sm:p-2 rounded-md border transition-all duration-300 hover:scale-[1.01] ${
                  isYourIdea
                    ? "bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/50 shadow-blue-500/20"
                    : "bg-gradient-to-br from-slate-700/30 to-slate-800/20 border-slate-600/50"
                } shadow-lg hover:shadow-xl backdrop-blur-sm`}
              >
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                  <div className="flex-1 min-w-0">
                    {isYourIdea && (
                      <div className="inline-flex items-center gap-1 mb-0.5 sm:mb-1">
                        <span className="bg-blue-600/50 text-blue-200 text-[9px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-full border border-blue-500/50">
                          ✨ Your Idea
                        </span>
                      </div>
                    )}

                    <h3
                      className="text-xs sm:text-sm font-bold text-white cursor-pointer hover:text-blue-300 transition-colors mb-0.5 sm:mb-1 leading-tight"
                      onClick={() => navigate(`/idea/${idea.id}`)}
                    >
                      {idea?.idea}
                    </h3>

                    <div className="text-[10px] sm:text-xs text-gray-200 mb-1 sm:mb-1.5 line-clamp-2 leading-tight">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none [&>*]:my-0 [&>*]:leading-tight text-[10px] sm:text-xs">
                        {idea?.description ?? ""}
                      </MarkdownWithPlugins>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400">
                      <span className="bg-slate-700/50 px-1 sm:px-1.5 py-0.5 rounded border border-slate-600/50">
                        ⚡ {techLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-1 sm:h-full">
                    <button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                      onClick={() => navigate(`/idea/${idea.id}`)}
                    >
                      👁️ View
                    </button>

                    {(isYourIdea || isAdmin) && (
                      <div className="relative sm:mt-auto">
                        <button
                          className="text-gray-400 hover:text-white transition-colors p-0.5 hover:bg-slate-700/50 rounded"
                          onClick={() => setMenuOpenId(menuOpenId === idea.id ? null : idea.id)}
                        >
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>

                        {menuOpenId === idea.id && (
                          <div className="absolute right-0 top-full mt-0.5 bg-slate-800 border border-slate-600 rounded shadow-xl py-0.5 min-w-[80px] z-20">
                            {isYourIdea && (
                              <button
                                onClick={() => setEditingIdea(idea)}
                                className="w-full px-2 py-1 text-left text-[9px] sm:text-[10px] text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(idea.id)}
                              className="w-full px-2 py-1 text-left text-[9px] sm:text-[10px] text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editingIdea && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: '2147483647', position: 'fixed' }}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: '2147483647', position: 'fixed', isolation: 'isolate' }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                onClick={() => setEditingIdea(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <EditIdea ideaData={editingIdea} onEditSuccess={handleEditSuccess} />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default Stage_1_Ideas;
