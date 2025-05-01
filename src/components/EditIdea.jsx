import { useState, useRef, useEffect } from "react";
import { editIdea } from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";

function EditIdea({ ideaData, onEditSuccess }) {
  const textRef = useRef(null);
  const [idea, setIdea] = useState(ideaData.idea);
  const [description, setDescription] = useState(ideaData.description);
  const [technologies, setTechnologies] = useState(ideaData.technologies);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (textRef.current) {
      textRef.current.addEventListener("click", () => {
        console.log(textRef.current.selectionStart);
      });
    }
  }, []);
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
    <div className="fixed inset-x-0 top-[4em]">
      <form
        onSubmit={handleEdit}
        className="p-6 border border-gray-300 space-y-4 shadow-lg"
        style={{
          width: "800px",
          margin: "0 auto",
          backgroundColor: "#030C18", // Dark blue background
          color: "white", // White text for readability
          borderRadius: "0px", // Remove rounded corners
        }}
      >
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Edit Idea:
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Edit your idea here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Edit Description:
          </label>
          <MarkdownPreviewer text={description}>
            <textarea
              ref={textRef}
              className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Edit your description here..."
            />
          </MarkdownPreviewer>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Edit Technologies:
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-black"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="Edit technologies here..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 focus:outline-none"
        >
          Update Idea
        </button>
        {message && <p className="text-sm mt-2 text-green-500">{message}</p>}
      </form>
    </div>
  );
}

export default EditIdea;
