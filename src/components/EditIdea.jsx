import { useState, useRef } from "react";
import { editIdea } from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";

function EditIdea({ ideaData, onEditSuccess }) {
  const textRef = useRef(null);
  const [idea, setIdea] = useState(ideaData.idea);
  const [description, setDescription] = useState(ideaData.description);
  const [technologies, setTechnologies] = useState(ideaData.technologies);
  const [message, setMessage] = useState("");
  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const response = await editIdea(
        ideaData.id,
        idea,
        description,
        technologies
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
