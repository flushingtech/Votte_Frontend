import { useState, useEffect, useRef } from "react";
import {
  submitIdea,
  getEventStage,
  getPreviousProjects,
} from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";

function IdeaSubmission({ email, eventId, refreshIdeas }) {
  const [idea, setIdea] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [isBuilt, setIsBuilt] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null); // 'new' | 'previous' | 'archived'
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
          className="bg-blue-600 text-white py-2 px-4 font-bold hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto"
        >
          Add Idea
        </button>
      )}

      {isFormVisible && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-x-0 top-[4em] z-50 flex items-center justify-center">
            <div
              className="relative p-6 space-y-4 shadow-lg"
              style={{
                width: "800px",
                margin: "0 auto",
                backgroundColor: "#030C18",
                color: "white",
                borderRadius: "0px",
              }}
            >
              <button
                onClick={() => {
                  setIsFormVisible(false);
                  setSelectedMode(null);
                }}
                className="absolute top-4 left-4 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 font-semibold"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-white text-center mb-6">
                Submit Your Idea
              </h2>

              {!selectedMode ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setSelectedMode("new")}
                    className="bg-blue-800 hover:bg-blue-900 text-white py-1.5 px-4 font-medium text-left w-64"
                  >
                    🧠 New Idea
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
                    className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-4 font-medium text-left w-64"
                  >
                    📂 Previous Projects
                  </button>
                  <button
                    onClick={() => setSelectedMode("archived")}
                    className="bg-gray-600 hover:bg-gray-900 text-white py-1.5 px-4 font-medium text-left w-64"
                  >
                    🗃️ Archived Projects
                  </button>
                </div>
              ) : selectedMode === "previous" ? (
                <div
                  className="space-y-2 max-h-64 overflow-y-auto pr-2"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {previousProjects.map((project, index) => (
                    <div
                      key={index}
                      className="bg-[#0E1A2B] border border-gray-700 rounded px-4 py-2 text-left"
                    >
                      <p className="font-semibold text-white text-sm">{project.idea}</p>
                      {project.event_title && (
                        <p className="text-gray-400 text-xs">Event: {project.event_title}</p>
                      )}
                      {project.contributors && (
                        <p className="text-gray-400 text-xs">
                          Contributors: {project.contributors
                            .split(',')
                            .map(c => c.trim().split('@')[0])
                            .join(', ')}

                        </p>
                      )}


                    </div>
                  ))}
                </div>


              ) : (
                <form onSubmit={handleIdeaSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Your Big Idea:
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your groundbreaking concept."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      A Good Description:
                    </label>
                    <MarkdownPreviewer textRef={textRef}>
                      <textarea
                        ref={textRef}
                        className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Clear and intriguing - easy to grasp yet sparks curiosity."
                      />
                    </MarkdownPreviewer>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Tech Magic:
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
                      value={technologies}
                      onChange={(e) => setTechnologies(e.target.value)}
                      placeholder="What cool technologies will you use to bring this to life?"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isBuilt}
                      onChange={(e) => setIsBuilt(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm font-bold text-white">
                      Is this idea already built?
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-2 px-4 font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Submit Idea
                  </button>
                </form>
              )}

              {message && (
                <p
                  className={`mt-4 text-sm font-semibold ${message.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                    }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IdeaSubmission;
