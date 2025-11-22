import { useState, useRef } from "react";
import { editIdea } from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";

function EditIdea({ ideaData, onEditSuccess }) {
  const textRef = useRef(null);
  const [idea, setIdea] = useState(ideaData.idea);
  const [description, setDescription] = useState(ideaData.description);
  const [technologies, setTechnologies] = useState(ideaData.technologies);
  const [githubRepo, setGithubRepo] = useState(ideaData.github_repo || "");
  const [message, setMessage] = useState("");
  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const response = await editIdea(
        ideaData.id,
        idea,
        description,
        technologies,
        githubRepo
      );
      setMessage("Idea updated successfully!");

      if (onEditSuccess) {
        onEditSuccess(response.idea);
      }
    } catch (error) {
      console.error("Error editing idea:", error);
      setMessage("Failed to update idea");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleEdit} className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Your Idea</h2>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            Idea Title:
          </label>
          <textarea
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white text-base"
            rows="2"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Edit your idea here..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            Description:
          </label>
          <MarkdownPreviewer textRef={textRef}>
            <textarea
              ref={textRef}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white text-base"
              rows="8"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Edit your description here..."
            />
          </MarkdownPreviewer>
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            Technologies:
          </label>
          <textarea
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white text-base"
            rows="2"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="Edit technologies here..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub Repository <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-base"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="https://github.com/username/repo or github.com/username/repo"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 text-base font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Update Idea
        </button>

        {message && (
          <p className="text-base mt-2 text-center text-green-400 font-medium">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default EditIdea;
