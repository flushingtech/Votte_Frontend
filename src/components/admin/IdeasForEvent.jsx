import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar'; // Import Navbar component
import { getIdeasForEvent, deleteIdea } from '../../api/API';

const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event; // Extract event from state

  useEffect(() => {
    if (!event?.id) {
      setError('Event ID is not defined.');
      setLoading(false);
      return;
    }

    const fetchIdeas = async () => {
      try {
        const data = await getIdeasForEvent(event.id);
        setIdeas(data);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas.');
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
      console.error('Error deleting idea:', error);
      alert('Failed to delete idea');
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin'); // Navigate back to Admin Dashboard
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar userName={userEmail} backToHome={true} />

      <div className="p-5">
        {/* Button Container */}
        <div className="max-w-3xl mx-auto p-4 border border-white mb-4">
          <button
            onClick={handleBackToAdmin}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
          >
            &larr; Admin
          </button>
        </div>

        {/* Ideas Container */}
        <div
          className="max-w-3xl mx-auto p-5 border border-white"
          style={{
            height: 'calc(100vh - 200px)', // Adjust the height to fill the screen dynamically
            overflowY: 'auto', // Enable scrolling when content overflows
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">
            Ideas for Event: {event.title} ({ideas.length} ideas)
          </h2>
          {ideas.length === 0 ? (
            <p className="text-center text-gray-500">
              No ideas have been submitted for this event yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {ideas.map((idea) => (
                <li
                  key={idea.id}
                  className="relative p-4 border border-gray-500 shadow"
                  style={{ backgroundColor: '#1E2A3A' }}
                >
                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                    <p className="text-gray-300 mt-1">{idea.description}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Status: {idea.is_built ? 'Built' : 'Not Built'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">By: {idea.email}</p>
                  </div>

                  {/* Delete Button in Top-Right */}
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="absolute top-2 right-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeasForEvent;
