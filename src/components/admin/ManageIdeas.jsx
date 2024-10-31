import { useEffect, useState } from 'react';
import { getIdeas, deleteIdea } from '../../api/API';

const ManageIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ideas when component mounts
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasData = await getIdeas(); // Use getIdeas from api.js
        setIdeas(ideasData);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas');
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  // Handle idea deletion
  const handleDelete = async (id) => {
    try {
      await deleteIdea(id); // Use deleteIdea from api.js
      setIdeas(ideas.filter((idea) => idea.id !== id)); // Remove deleted idea from state
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea');
    }
  };

  if (loading) return <p>Loading ideas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-lg w-full text-left">
      <h2 className="text-3xl font-bold mb-4">Manage Ideas</h2>
      <ul className="space-y-4">
        {ideas.map((idea) => (
          <li key={idea.id} className="flex justify-between items-center bg-[#2E3B4E] p-4 rounded">
            <div>
              <h3 className="text-lg font-semibold">{idea.title}</h3>
              <p className="text-gray-400">{idea.description}</p>
            </div>
            <button
              onClick={() => handleDelete(idea.id)}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageIdeas;
