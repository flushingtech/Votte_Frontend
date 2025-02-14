import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import {
  getIdeasForEvent,
  deleteIdea,
  getEventStage,
  setEventStage,
  setEventSubStage,
  setEventToResultsTime,
  updateAverageScores,
  setIdeaStage // ✅ Add this import
} from '../../api/API';


const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStage, setEventStageState] = useState(1);
  const [eventSubStage, setEventSubStageState] = useState("1");

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

  const handleToggleIdeaSelection = async (ideaId, currentStage) => {
    const newStage = currentStage === 2 ? 1 : 2; // Toggle between Stage 1 and 2

    try {
      const updatedIdea = await setIdeaStage(ideaId, newStage);
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === ideaId ? updatedIdea : idea
        )
      );
    } catch (error) {
      console.error("Error updating idea stage:", error);
      alert("Failed to update idea stage.");
    }
  };

  const handleStartMostCreativeVoting = async () => {
    try {
      console.log(`Attempting to transition event ${event.id} to Stage 2.1 (Most Creative Voting)...`);

      // Ensure the event is at Stage 2 before changing sub-stage
      if (eventStage !== 2) {
        console.log(`Setting event ${event.id} to Stage 2...`);
        const updatedEvent = await setEventStage(event.id, 2);
        setEventStageState(updatedEvent.stage);

        if (updatedEvent.stage !== 2) {
          alert("Failed to update event to Stage 2.");
          return;
        }
      }

      // Now, set the sub-stage to 2.1 (Most Creative)
      const updatedEventSubStage = await setEventSubStage(event.id, "1");
      console.log("API Response:", updatedEventSubStage);

      if (updatedEventSubStage.stage === 2 && updatedEventSubStage.current_sub_stage === "1") {
        setEventSubStageState(updatedEventSubStage.current_sub_stage);
        alert(`Event "${updatedEventSubStage.title}" is now in Stage 2.1 (Most Creative Voting)!`);
      } else {
        console.error("Stage update mismatch:", updatedEventSubStage);
        alert("Failed to transition to Most Creative Voting. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Error transitioning to Most Creative Voting:", error);
      alert("Failed to transition to Most Creative Voting.");
    }
  };


  const handleStartMostTechnicalVoting = async () => {
    try {
      console.log(`Attempting to transition event ${event.id} to Stage 2.2 (Most Technical Voting)...`);

      // Ensure the event is at Stage 2 before changing sub-stage
      if (eventStage !== 2) {
        console.log(`Setting event ${event.id} to Stage 2...`);
        const updatedEvent = await setEventStage(event.id, 2);
        setEventStageState(updatedEvent.stage);

        if (updatedEvent.stage !== 2) {
          alert("Failed to update event to Stage 2.");
          return;
        }
      }

      // Now, set the sub-stage to 2.2 (Most Technical)
      const updatedEventSubStage = await setEventSubStage(event.id, "2");
      console.log("API Response:", updatedEventSubStage);

      if (updatedEventSubStage.stage === 2 && updatedEventSubStage.current_sub_stage === "2") {
        setEventSubStageState(updatedEventSubStage.current_sub_stage);
        alert(`Event "${updatedEventSubStage.title}" is now in Stage 2.2 (Most Technical Voting)!`);
      } else {
        console.error("Stage update mismatch:", updatedEventSubStage);
        alert("Failed to transition to Most Technical Voting. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Error transitioning to Most Technical Voting:", error);
      alert("Failed to transition to Most Technical Voting.");
    }
  };


  const handleStartResultsPhase = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 3); // Move to Stage 3 (Results)
      setEventStageState(updatedEvent.stage);
      alert(`Event "${updatedEvent.title}" is now in Results Phase!`);
    } catch (error) {
      console.error("Error transitioning to Results Phase:", error);
      alert("Failed to transition to Results Phase.");
    }
  };

  const handleBackToSubmissions = async () => {
    try {
      console.log(`Attempting to move event ${event.id} back to Stage 1...`);

      const updatedEvent = await setEventStage(event.id, 1); // Move back to Stage 1
      setEventStageState(updatedEvent.stage);

      if (updatedEvent.stage !== 1) {
        alert("Failed to move event back to Stage 1.");
        return;
      }

      // Reset to Sub-Stage 1.1 (Open Submissions)
      const updatedEventSubStage = await setEventSubStage(event.id, "1");
      setEventSubStageState(updatedEventSubStage.current_sub_stage);

      alert(`Event "${updatedEvent.title}" is now back to Stage 1 (Idea Submissions Open)!`);
    } catch (error) {
      console.error("Error transitioning back to Idea Submissions:", error);
      alert("Failed to go back to Idea Submissions.");
    }
  };


  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar userName={userEmail} backToHome={true} />

      <div className="p-5">
        <div className="max-w-3xl mx-auto p-4 border border-white mb-4">
          {/* Display Event Stage and Sub-Stage */}
          <p className="text-white text-lg font-semibold">
            Current Stage: {eventStage}
            {eventStage === 1 && ` (Sub-Stage ${eventSubStage})`}
            {eventStage === 2 && (
              ` (${eventSubStage === "1" ? "Most Creative Voting" : "Most Technical Voting"})`
            )}
          </p>

          {/* Stage 1 Controls */}
          {eventStage === 1 && (
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleToggleSubStage}
                className={`px-4 py-2 rounded transition-all w-40 text-sm ${eventSubStage === "2"
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {eventSubStage === "2" ? "Unlock Submissions" : "Lock Submissions"}
              </button>

              {eventSubStage === "2" && (
                <button
                  onClick={handleStartMostCreativeVoting}
                  className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  Votte Time
                </button>
              )}
            </div>
          )}


          {/* Stage 2 Controls */}
          {eventStage === 2 && (
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleBackToSubmissions}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Back to Idea Submissions
              </button>

              {eventSubStage === "1" && (
                <button
                  onClick={handleStartMostTechnicalVoting}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Start Most Technical Voting
                </button>
              )}

              {eventSubStage === "2" && (
                <button
                  onClick={handleStartResultsPhase}
                  className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Start Results Phase
                </button>
              )}
            </div>
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
                  className={`p-4 border border-gray-500 bg-[#1E2A3A] flex items-center relative transition-all duration-300 ${idea.stage === 2 ? "border-green-500 shadow-green-glow" : ""
                    }`}
                >

                  {/* Checkbox to toggle idea stage */}
                  <div className="flex items-center">
  {/* Checkbox to toggle idea stage */}
  {eventStage === 1 && eventSubStage === "2" && (
    <input
      type="checkbox"
      checked={idea.stage === 2}
      onChange={() => handleToggleIdeaSelection(idea.id, idea.stage)}
      className="mr-3 cursor-pointer"
    />
  )}

  {/* Idea details */}
  <div>
    <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
    <p className="text-gray-300 mt-1">{idea.description}</p>
  </div>
</div>


                  {/* Glowing effect for Stage 2 ideas */}
                  {idea.stage === 2 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md animate-pulse">
                      In Voting Stage
                    </span>
                  )}
                </li>
              ))}
            </ul>

          )}
        </div>
      </div>

      <style>
        {`
    .shadow-green-glow {
      box-shadow: 0px 0px 10px rgba(34, 197, 94, 0.8);
    }
  `}
      </style>

    </div>
  );
};

export default IdeasForEvent;
