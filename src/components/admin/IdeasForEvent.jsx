import { useEffect, useState } from "react";
import { getIdeasForEvent, deleteIdea } from "../../api/API";

const IdeasForEvent = ({ event, onBack, userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!event?.id) {
      setError("Event ID is not defined.");
      setLoading(false);
      return;
    }

    const fetchIdeas = async () => {
      try {
        const data = await getIdeasForEvent(event.id);
        setIdeas(data);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("Failed to load ideas.");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [event?.id]);

  const handleDelete = async (ideaId) => {
    try {
      await deleteIdea(ideaId, userEmail);
      setIdeas(ideas.filter((idea) => idea.id !== ideaId));
    } catch (error) {
      console.error("Error deleting idea:", error);
      alert("Failed to delete idea");
    }
  };

  if (loading) return <p>Loading ideas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="text-left">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
      >
        Back to Events
      </button>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Ideas for Event: {event.title} ({ideas.length} ideas)
      </h2>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li
            key={idea.id}
            className="flex justify-between items-center p-3 bg-[#2E3B4E] rounded shadow"
          >
            <div>
              <h3 className="text-md font-semibold text-white">{idea.idea}</h3>
              <p className="text-gray-400">{idea.description}</p>
            </div>
            <button
              onClick={() => handleDelete(idea.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IdeasForEvent;
