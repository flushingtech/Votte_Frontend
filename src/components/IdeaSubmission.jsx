import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  submitIdea,
  getEventStage,
  getPreviousProjects,
  addIdeaToEvent,
} from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";

function IdeaSubmission({ email, eventId, refreshIdeas }) {
  const [idea, setIdea] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [isBuilt, setIsBuilt] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [eventStage, setEventStage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previousProjects, setPreviousProjects] = useState([]);
  const textRef = useRef(null);

  useEffect(() => {
    const fetchEventStage = async () => {
      try {
        const eventStageData = await getEventStage(eventId);
        setEventStage(eventStageData.stage);
      } catch (error) {
        console.error("Error fetching event stage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventStage();
  }, [eventId]);

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();

    if (!idea || !description || !technologies) {
      setMessage("Please fill in all fields: idea, description, and technologies");
      return;
    }

    try {
      const response = await submitIdea(email, idea, description, technologies, eventId, isBuilt);
      if (response.status === 201) {
        setMessage("Idea submitted successfully!");
        setIdea("");
        setDescription("");
        setTechnologies("");
        setIsBuilt(false);
        setIsFormVisible(false);
        setSelectedMode(null);
        if (refreshIdeas) refreshIdeas();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(error.response.data.message);
      } else {
        console.error("Error submitting idea:", error);
        setMessage("An error occurred while submitting your idea.");
      }
    }
  };

  const handleAddToEvent = async (ideaId) => {
    try {
      await addIdeaToEvent(ideaId, eventId);
      setMessage("Added to event successfully!");
      if (refreshIdeas) refreshIdeas();
    } catch (error) {
      console.error("Failed to add idea to event:", error);
      setMessage("Failed to add idea to event.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="w-full text-center">
      {eventStage === 2 ? (
        <p className="text-yellow-500 font-bold text-lg">
          Votte Time - Submissions are closed.
        </p>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-base font-semibold rounded-lg sm:rounded-xl border border-blue-500/50 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          💡 Add New Idea
        </button>
      )}

      {isFormVisible && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: '2147483647', position: 'fixed' }}></div>
          <div className="fixed inset-0 flex items-start justify-center p-4 pt-16 pb-8" style={{ zIndex: '2147483647', position: 'fixed', isolation: 'isolate' }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsFormVisible(false);
                  setSelectedMode(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Submit Your Idea
                </h2>
                <p className="text-gray-400">Share your innovative concept with the community</p>
              </div>

              {!selectedMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedMode("new")}
                    className="bg-gradient-to-br from-blue-600/30 to-blue-800/20 backdrop-blur-sm rounded-xl border border-blue-500/50 p-6 hover:from-blue-500/40 hover:to-blue-700/30 transition-all duration-200 hover:scale-105 text-center group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧠</div>
                    <h3 className="text-white font-semibold mb-2">New Idea</h3>
                    <p className="text-gray-400 text-sm">Start fresh with a brand new concept</p>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const data = await getPreviousProjects();
                        setPreviousProjects(data.ideas || data);
                        setSelectedMode("previous");
                      } catch (err) {
                        console.error("Failed to load previous projects:", err);
                      }
                    }}
                    className="bg-gradient-to-br from-green-600/30 to-green-800/20 backdrop-blur-sm rounded-xl border border-green-500/50 p-6 hover:from-green-500/40 hover:to-green-700/30 transition-all duration-200 hover:scale-105 text-center group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📂</div>
                    <h3 className="text-white font-semibold mb-2">Previous Projects</h3>
                    <p className="text-gray-400 text-sm">Reuse ideas from past events</p>
                  </button>
                  <button
                    onClick={() => setSelectedMode("archived")}
                    className="bg-gradient-to-br from-purple-600/30 to-purple-800/20 backdrop-blur-sm rounded-xl border border-purple-500/50 p-6 hover:from-purple-500/40 hover:to-purple-700/30 transition-all duration-200 hover:scale-105 text-center group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🗃️</div>
                    <h3 className="text-white font-semibold mb-2">Archived Projects</h3>
                    <p className="text-gray-400 text-sm">Browse archived concepts</p>
                  </button>
                </div>
              ) : selectedMode === "previous" ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setSelectedMode(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-white">Previous Projects</h3>
                  </div>
                  
                  {previousProjects.map((project) => {
                    const isSameEvent = String(project.event_id) === String(eventId);
                    const contributorNames = project.contributors
                      ? project.contributors.split(',').map(c => c.trim().split('@')[0]).join(', ')
                      : '';

                    return (
                      <div
                        key={project.id}
                        className="bg-slate-800/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/30 transition-colors"
                      >
                        <h4 className="font-semibold text-white text-base mb-2">{project.idea}</h4>

                        {project.event_title && project.event_date && (
                          <p className="text-gray-400 text-sm mb-1">
                            📅 {project.event_title} • {new Date(project.event_date).toLocaleDateString()}
                          </p>
                        )}

                        {project.contributors && (
                          <p className="text-gray-400 text-sm mb-3">
                            👥 {contributorNames}
                          </p>
                        )}

                        {!isSameEvent && (
                          <button
                            onClick={() => handleAddToEvent(project.id)}
                            className="bg-blue-600/50 text-blue-200 hover:bg-blue-500/50 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-500/50 transition-colors"
                          >
                            ➕ Add to This Event
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={() => setSelectedMode(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-white">New Idea Form</h3>
                  </div>

                  <form onSubmit={handleIdeaSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">💡 Your Big Idea</label>
                      <textarea
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Describe your groundbreaking concept..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">📝 Detailed Description</label>
                      <MarkdownPreviewer textRef={textRef}>
                        <textarea
                          ref={textRef}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Clear and intriguing - easy to grasp yet sparks curiosity..."
                          rows={4}
                        />
                      </MarkdownPreviewer>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">⚡ Tech Stack</label>
                      <textarea
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        value={technologies}
                        onChange={(e) => setTechnologies(e.target.value)}
                        placeholder="What technologies will you use to bring this to life?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                      <input
                        type="checkbox"
                        checked={isBuilt}
                        onChange={(e) => setIsBuilt(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-300">
                        🚀 This idea is already built and ready
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 font-semibold rounded-xl border border-orange-500/50 hover:from-orange-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      🚀 Submit Idea
                    </button>
                  </form>
                </div>
              )}
              {message && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  message.includes("successfully") 
                    ? "bg-green-600/20 border-green-500/50 text-green-300" 
                    : "bg-red-600/20 border-red-500/50 text-red-300"
                }`}>
                  <div className="flex items-center gap-2">
                    {message.includes("successfully") ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default IdeaSubmission;
