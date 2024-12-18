import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import {
  getIdeasForEvent,
  deleteIdea,
  setIdeaStage,
  getEventStage,
  setEventStage,
  setEventToResultsTime,
  updateAverageScores,
} from '../../api/API';

const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStage, setEventStageState] = useState(1);
  const [deletePromptVisible, setDeletePromptVisible] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  useEffect(() => {
    if (!event?.id) {
      setError('Event ID is not defined.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [ideasData, eventStageData] = await Promise.all([
          getIdeasForEvent(event.id),
          getEventStage(event.id),
        ]);
        setIdeas(ideasData);
        setEventStageState(eventStageData.stage || 1);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [event?.id]);

  const handleDelete = async () => {
    if (!ideaToDelete) return;

    try {
      await deleteIdea(ideaToDelete.id, userEmail);
      setIdeas((prevIdeas) =>
        prevIdeas.filter((idea) => idea.id !== ideaToDelete.id)
      );
      setDeletePromptVisible(false);
      setIdeaToDelete(null);
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Failed to delete idea');
    }
  };

  const handleResultsTime = async () => {
    try {
      // Transition the event to Results Time (Stage 3)
      const updatedEvent = await setEventToResultsTime(event.id);
      setEventStageState(updatedEvent.stage);
  
      // Call the backend to update average scores for all ideas
      await updateAverageScores(); // Updated function for average scores
  
      // Refetch the updated ideas to reflect average scores
      const updatedIdeas = await getIdeasForEvent(event.id);
      setIdeas(updatedIdeas);
  
      alert(`Event "${updatedEvent.title}" is now in Results Time (Stage 3)! Average scores updated.`);
    } catch (error) {
      console.error('Error transitioning to Results Time or updating scores:', error);
      alert('Failed to transition to Results Time or update average scores.');
    }
  };
  
  

  const handleBackToVotteTime = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 2);
      setEventStageState(updatedEvent.stage);
      alert(`Event "${updatedEvent.title}" is now back to Votte Time (Stage 2)!`);
    } catch (error) {
      console.error('Error transitioning back to Votte Time:', error);
      alert('Failed to transition back to Votte Time.');
    }
  };

  const handleToggleEventStage = async () => {
    try {
      const targetStage = eventStage === 2 ? 1 : 2; // Toggle between Stage 1 and 2
      const updatedEvent = await setEventStage(event.id, targetStage);
      setEventStageState(updatedEvent.stage);
      alert(
        `Event "${updatedEvent.title}" is now in ${
          targetStage === 1 ? 'Stage 1' : 'Votte Time (Stage 2)'
        }!`
      );
    } catch (error) {
      console.error('Error toggling event stage:', error);
      alert('Failed to toggle event stage.');
    }
  };

  const handleToggleIdeaStage = async (ideaId, targetStage) => {
    try {
      const updatedIdea = await setIdeaStage(ideaId, targetStage);
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
      );
    } catch (error) {
      console.error('Error setting stage:', error);
      alert('Failed to set stage');
    }
  };

  const openDeletePrompt = (idea) => {
    setIdeaToDelete(idea);
    setDeletePromptVisible(true);
  };

  const closeDeletePrompt = () => {
    setDeletePromptVisible(false);
    setIdeaToDelete(null);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar userName={userEmail} backToHome={true} />

      <div className="p-5">
        {/* Button Container */}
        <div className="max-w-3xl mx-auto p-4 border border-white mb-4 flex space-x-4">
          <button
            onClick={handleBackToAdmin}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-all w-32 text-sm"
          >
            &larr; Admin
          </button>
          <button
            onClick={() => console.log('Delete All clicked')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all w-32 text-sm"
          >
            Delete All
          </button>
          {eventStage !== 3 && (
            <button
              onClick={handleToggleEventStage}
              className={`px-4 py-2 rounded transition-all w-32 text-sm ${
                eventStage === 2
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {eventStage === 2 ? 'UnVotte Time' : 'Votte Time'}
            </button>
          )}
          {eventStage === 2 && (
            <button
              onClick={handleResultsTime}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all w-32 text-sm"
            >
              Results Time
            </button>
          )}
          {eventStage === 3 && (
            <button
              onClick={handleBackToVotteTime}
              className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-all w-32 text-sm"
            >
              Back to Votte Time
            </button>
          )}
        </div>

        {/* Ideas Container */}
        <div className="max-w-3xl mx-auto p-5 border border-white">
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
                  className={`flex justify-between p-4 border shadow ${
                    idea.stage === 2 ? 'glowing-border border-green-500' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: '#1E2A3A' }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                    <p className="text-gray-300 mt-1">{idea.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => openDeletePrompt(idea)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 w-32"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleToggleIdeaStage(idea.id, idea.stage === 2 ? 1 : 2)
                      }
                      className={`px-3 py-1 text-sm rounded w-32 ${
                        idea.stage === 2
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {idea.stage === 2 ? 'UnVotte' : 'Votte'}
                    </button>
                    <button
                      onClick={() => console.log(`Archive clicked for idea: ${idea.id}`)}
                      className="px-3 py-1 text-sm bg-gray-300 text-black rounded hover:bg-gray-400 w-32"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Inline CSS for glowing effect */}
      <style jsx>{`
        .glowing-border {
          animation: glowing 1.5s infinite;
        }

        @keyframes glowing {
          0% {
            box-shadow: 0 0 5px #00ff00;
          }
          50% {
            box-shadow: 0 0 20px #00ff00;
          }
          100% {
            box-shadow: 0 0 5px #00ff00;
          }
        }
      `}</style>
    </div>
  );
};

export default IdeasForEvent;
