// ... all your imports remain unchanged
import { useEffect, useState } from 'react';
import Select from 'react-select';
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
  setIdeaStage,
  addContributorToIdea,
  getAllUsers,
  determineWinners
} from '../../api/API';

const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStage, setEventStageState] = useState(1);
  const [eventSubStage, setEventSubStageState] = useState("1");
  const [contributorInputs, setContributorInputs] = useState({});
  const [users, setUsers] = useState([]);

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
        const [ideasData, eventStageData, allUsers] = await Promise.all([
          getIdeasForEvent(event.id),
          getEventStage(event.id),
          getAllUsers()
        ]);
        setIdeas(ideasData);
        setEventStageState(eventStageData.stage || 1);
        setEventSubStageState(eventStageData.current_sub_stage || "1");
        setUsers(allUsers);
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

  const handleBackToSubmissionsOpen = async () => {
    try {
      if (eventStage !== 1) {
        const updatedEvent = await setEventStage(event.id, 1);
        setEventStageState(updatedEvent.stage);
      }
      const updatedEventSubStage = await setEventSubStage(event.id, "1");
      setEventSubStageState(updatedEventSubStage.current_sub_stage);
      alert(`Event "${updatedEventSubStage.title}" is now back in Stage 1.1 (Open Submissions)!`);
    } catch (error) {
      console.error("Error moving back to Open Submissions:", error);
      alert("Failed to move back to Open Submissions.");
    }
  };

  const handleStartVoting = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 2);
      setEventStageState(updatedEvent.stage);
      alert(`Event "${updatedEvent.title}" is now in Stage 2 (Voting Started)!`);
    } catch (error) {
      console.error("Error starting voting:", error);
      alert("Failed to start voting.");
    }
  };

  const handleBackToVoting = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 2);
      setEventStageState(updatedEvent.stage);
      alert(`Event "${updatedEvent.title}" is now back in Stage 2 (Voting)!`);
    } catch (error) {
      console.error("Error moving back to voting:", error);
      alert("Failed to move back to voting.");
    }
  };

  const handleShowResults = async () => {
    if (window.confirm("Are you sure you want to show the results? This will finalize the event.")) {
      try {
        await determineWinners(event.id);
        const updated = await setEventToResultsTime(event.id);
        setEventStageState(updated.stage);
        alert("Event has been moved to Results Time!");
      } catch (error) {
        console.error("Error showing results:", error);
        alert("Failed to show results.");
      }
    }
  };

  const handleToggleIdeaSelection = async (ideaId, currentStage) => {
    if (eventStage !== 1 || eventSubStage !== "2") {
      alert("You can only select ideas when the event is in Locked Submissions (Stage 1.2).");
      return;
    }

    const newStage = currentStage === 2 ? 1 : 2;

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

  const handleAddContributor = async (ideaId) => {
    const contributorEmail = contributorInputs[ideaId]?.trim();
    if (!contributorEmail) {
      alert('Please select a contributor.');
      return;
    }
    try {
      await addContributorToIdea(ideaId, contributorEmail);
      alert('Contributor added successfully!');
      setContributorInputs((prev) => ({
        ...prev,
        [ideaId]: '',
      }));
    } catch (error) {
      console.error('Error adding contributor:', error);
      alert('Failed to add contributor.');
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading ideas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar userName={userEmail} backToHome={true} />

      <div className="p-5">
        <div className="max-w-3xl mx-auto p-4 border border-white mb-4">
          <p className="text-white text-lg font-semibold">
            Current Stage: {eventStage}
            {eventStage === 1 && ` (Sub-Stage ${eventSubStage})`}
            {eventStage === 2 && " (Voting Phase)"}
            {eventStage === 3 && " (Results Time)"}
          </p>

          {eventStage === 1 && (
            <div className="flex space-x-4 mt-2">
              {eventSubStage === "1" && (
                <button
                  onClick={handleToggleSubStage}
                  className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Lock Submissions
                </button>
              )}
              {eventSubStage === "2" && (
                <>
                  <button
                    onClick={handleStartVoting}
                    className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                  >
                    Start Voting
                  </button>
                  <button
                    onClick={handleBackToSubmissionsOpen}
                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                  >
                    Back to Open Submissions
                  </button>
                </>
              )}
            </div>
          )}

          {eventStage === 2 && (
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleShowResults}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
              >
                Show Results
              </button>
              <button
                onClick={handleBackToSubmissionsOpen}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Back to Submissions
              </button>
            </div>
          )}

          {eventStage === 3 && (
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleBackToVoting}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Back to Voting
              </button>
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
                  className={`p-4 border border-gray-500 bg-[#1E2A3A] transition-all duration-300 space-y-3 ${idea.stage === 2 ? "border-green-500 shadow-green-glow" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Select
                      className="w-full sm:w-2/3 text-sm"
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: '#0F172A',
                          borderColor: '#3B82F6',
                          color: 'white',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'white',
                          color: 'black',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? '#E5E7EB' : 'white',
                          color: 'black',
                          cursor: 'pointer',
                        }),
                        singleValue: (base) => ({ ...base, color: 'white' }),
                        input: (base) => ({ ...base, color: 'white' }),
                      }}
                      options={users.map(user => ({
                        label: `${user.name} (${user.email})`,
                        value: user.email
                      }))}
                      placeholder="Select contributor..."
                      value={users
                        .map(user => ({
                          label: `${user.name} (${user.email})`,
                          value: user.email
                        }))
                        .find(opt => opt.value === contributorInputs[idea.id]) || null}
                      onChange={(selectedOption) =>
                        setContributorInputs(prev => ({
                          ...prev,
                          [idea.id]: selectedOption?.value || ''
                        }))
                      }
                    />
                    <button
                      onClick={() => handleAddContributor(idea.id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white">{idea.idea}</h3>
                    <p className="text-gray-300 text-sm">{idea.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    {idea.stage === 2 && (
                      <span className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-sm">
                        In Voting Stage
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleIdeaSelection(idea.id, idea.stage)}
                      className={`px-4 py-2 rounded-sm text-white transition-all 
                        ${idea.stage === 2 ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}`}
                    >
                      {idea.stage === 2 ? "Deselect Idea" : "Select for Voting"}
                    </button>
                  </div>
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
