import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import {
  getIdeasForEvent,
  deleteIdea,
  setIdeaStage,
  getEventStage,
  setEventStage,
  setEventSubStage,
  setEventToResultsTime,
  updateAverageScores,
} from '../../api/API';

const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStage, setEventStageState] = useState(1);
  const [eventSubStage, setEventSubStageState] = useState("1");
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
        setEventSubStageState(eventStageData.current_sub_stage || "1");
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

  const handleToggleSubStage = async () => {
    try {
      const newSubStage = eventSubStage === "1" ? "2" : "1";
      const updatedEvent = await setEventSubStage(event.id, newSubStage);
      setEventSubStageState(updatedEvent.current_sub_stage);
      alert(`Event "${updatedEvent.title}" is now in Sub-Stage ${newSubStage === "1" ? "1.1 (Open)" : "1.2 (Locked)"}`);
    } catch (error) {
      console.error("Error toggling sub-stage:", error);
      alert("Failed to toggle event sub-stage.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar userName={userEmail} backToHome={true} />

      <div className="p-5">
        <div className="max-w-3xl mx-auto p-4 border border-white mb-4 flex space-x-4">
          {eventStage === 1 && (
            <button
              onClick={handleToggleSubStage}
              className={`px-4 py-2 rounded transition-all w-32 text-sm ${
                eventSubStage === "2"
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {eventSubStage === "2" ? "Unlock Submissions" : "Lock Submissions"}
            </button>
          )}
        </div>

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
