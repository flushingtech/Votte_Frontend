import { useEffect, useState } from 'react';
import { getIdeas, deleteIdea } from '../../api/API';

const ManageIdeas = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasData = await getIdeas();
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

  const handleDelete = async (id) => {
    try {
      console.log('Attempting to delete idea:', id, 'by admin:', userEmail); // Debugging
      await deleteIdea(id, userEmail); // Ensure userEmail is passed correctly
      setIdeas(ideas.filter((idea) => idea.id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea');
    }
  };

  if (loading) return <p>Loading ideas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full text-left">
      <h2 className="text-xl font-bold mb-4">Manage Ideas</h2>
      <ul className="space-y-3">
        {ideas.map((idea) => (
          <li key={idea.id} className="flex justify-between items-center bg-[#2E3B4E] p-3 rounded">
            <div>
              <h3 className="text-md font-semibold">{idea.idea}</h3>
              <p className="text-gray-400 text-sm">{idea.description}</p>
            </div>
            <button
              onClick={() => handleDelete(idea.id)}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-all"
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
