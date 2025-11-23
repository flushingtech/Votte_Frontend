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
  determineWinners,
  getUserProfile
} from '../../api/API';

const IdeasForEvent = ({ userEmail }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStage, setEventStageState] = useState(1);
  const [eventSubStage, setEventSubStageState] = useState("1");
  const [contributorInputs, setContributorInputs] = useState({});
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showResultsConfirm, setShowResultsConfirm] = useState(false);
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();

  // Fetch user display name
  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);
  const location = useLocation();
  const event = location.state?.event;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      showNotification(`Event is now in Sub-Stage ${newSubStage === "1" ? "1.1 (Open)" : "1.2 (Locked)"}`, 'success');
    } catch (error) {
      console.error("Error toggling sub-stage:", error);
      showNotification("Failed to toggle event sub-stage.", 'error');
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
      showNotification('📝 Back to Open Submissions!', 'success');
    } catch (error) {
      console.error("Error moving back to Open Submissions:", error);
      showNotification("Failed to move back to Open Submissions.", 'error');
    }
  };

  const handleStartVoting = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 2);
      setEventStageState(updatedEvent.stage);
      showNotification('🗳️ Voting has started!', 'success');
    } catch (error) {
      console.error("Error starting voting:", error);
      showNotification("Failed to start voting.", 'error');
    }
  };

  const handleBackToVoting = async () => {
    try {
      const updatedEvent = await setEventStage(event.id, 2);
      setEventStageState(updatedEvent.stage);
      showNotification('🗳️ Back to Voting!', 'success');
    } catch (error) {
      console.error("Error moving back to voting:", error);
      showNotification("Failed to move back to voting.", 'error');
    }
  };

  const handleShowResults = () => {
    setShowResultsConfirm(true);
  };

  const confirmShowResults = async () => {
    setShowResultsConfirm(false);
    try {
      await determineWinners(event.id);
      const updated = await setEventToResultsTime(event.id);
      setEventStageState(updated.stage);
      showNotification('🏆 Results are now live!', 'success');
    } catch (error) {
      console.error("Error showing results:", error);
      showNotification("Failed to show results.", 'error');
    }
  };

  const handleToggleIdeaSelection = async (ideaId, currentStage) => {
    if (eventStage !== 1 || eventSubStage !== "2") {
      showNotification("You can only select ideas when the event is in Locked Submissions (Stage 1.2).", 'error');
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
      showNotification(newStage === 2 ? '✅ Idea selected for voting' : 'Idea deselected', 'success');
    } catch (error) {
      console.error("Error updating idea stage:", error);
      showNotification("Failed to update idea stage.", 'error');
    }
  };

  const handleAddContributor = async (ideaId) => {
    const contributorEmail = contributorInputs[ideaId]?.trim();
    if (!contributorEmail) {
      showNotification('Please select a contributor.', 'error');
      return;
    }
    try {
      await addContributorToIdea(ideaId, contributorEmail);
      showNotification('👥 Contributor added successfully!', 'success');
      setContributorInputs((prev) => ({
        ...prev,
        [ideaId]: '',
      }));
    } catch (error) {
      console.error('Error adding contributor:', error);
      showNotification('Failed to add contributor.', 'error');
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
        }}
      >
        <Navbar userName={userName || userEmail} backToHome={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading ideas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
        }}
      >
        <Navbar userName={userName || userEmail} backToHome={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}
    >
      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} backToHome={true} />
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-gray-400 text-lg">{ideas.length} ideas submitted</p>
          </div>

          {/* Admin Controls Panel */}
          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-xl border border-orange-700/50 shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">⚙️ Admin Controls</h2>
              <span className="bg-orange-600/50 text-orange-200 px-4 py-2 rounded-full text-sm font-bold border border-orange-500/50">
                Stage {eventStage}{eventStage === 1 && `.${eventSubStage}`}
                {eventStage === 1 && eventSubStage === "1" && " - Open"}
                {eventStage === 1 && eventSubStage === "2" && " - Locked"}
                {eventStage === 2 && " - Voting"}
                {eventStage === 3 && " - Results"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Stage 1.1 controls */}
              {eventStage === 1 && eventSubStage === "1" && (
                <button
                  onClick={handleToggleSubStage}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-lg"
                >
                  🔒 Lock Submissions
                </button>
              )}

              {/* Stage 1.2 controls */}
              {eventStage === 1 && eventSubStage === "2" && (
                <>
                  <button
                    onClick={handleStartVoting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-lg"
                  >
                    🗳️ Start Voting
                  </button>
                  <button
                    onClick={handleBackToSubmissionsOpen}
                    className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg"
                  >
                    🔓 Unlock Submissions
                  </button>
                </>
              )}

              {/* Stage 2 controls */}
              {eventStage === 2 && (
                <>
                  <button
                    onClick={handleShowResults}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg"
                  >
                    🏆 Show Results
                  </button>
                  <button
                    onClick={handleBackToSubmissionsOpen}
                    className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg"
                  >
                    ← Back to Submissions
                  </button>
                </>
              )}

              {/* Stage 3 controls */}
              {eventStage === 3 && (
                <button
                  onClick={handleBackToVoting}
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 shadow-lg"
                >
                  ← Back to Voting
                </button>
              )}
            </div>
          </div>

          {/* Ideas List */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">💡 Submitted Ideas</h2>

            {ideas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">No ideas have been submitted yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {ideas.map((idea) => (
                  <li
                    key={idea.id}
                    className={`bg-gradient-to-br from-slate-700/30 to-slate-800/20 backdrop-blur-sm rounded-xl border transition-all duration-300 p-6 ${
                      idea.stage === 2
                        ? 'border-green-500/70 shadow-lg shadow-green-500/20'
                        : 'border-slate-600/50'
                    }`}
                  >
                    {/* Idea Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{idea.idea}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{idea.description}</p>
                      </div>
                      {idea.stage === 2 && (
                        <span className="bg-green-600/30 text-green-200 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/50 whitespace-nowrap">
                          ✓ Selected
                        </span>
                      )}
                    </div>

                    {/* Contributor Section */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-4 border-b border-slate-700/50">
                      <Select
                        className="flex-1 text-sm"
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor: '#334155',
                            borderColor: '#475569',
                            color: 'white',
                            minHeight: '42px',
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: '#1e293b',
                            color: 'white',
                            zIndex: 9999,
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                            color: 'white',
                            cursor: 'pointer',
                          }),
                          singleValue: (base) => ({ ...base, color: 'white' }),
                          input: (base) => ({ ...base, color: 'white' }),
                          placeholder: (base) => ({ ...base, color: '#9ca3af' }),
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
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg whitespace-nowrap"
                      >
                        👥 Add Contributor
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleToggleIdeaSelection(idea.id, idea.stage)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                          idea.stage === 2
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                        }`}
                      >
                        {idea.stage === 2 ? '✗ Deselect' : '✓ Select for Voting'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Show Results */}
      {showResultsConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setShowResultsConfirm(false)}
          ></div>
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 max-w-md w-full animate-slide-down">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-3">Show Results?</h2>
                <p className="text-gray-300 text-base">
                  Are you sure you want to show the results? This will finalize the event and display the winners.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResultsConfirm(false)}
                  className="flex-1 bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-white px-4 py-3 rounded-lg font-semibold hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-200 border border-slate-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShowResults}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg"
                  style={{
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                  }}
                >
                  🏆 Show Results
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
          <div
            className={`px-6 py-4 rounded-xl border shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-br from-green-600/90 to-emerald-600/90 border-green-500/50 text-green-50'
                : 'bg-gradient-to-br from-red-600/90 to-rose-600/90 border-red-500/50 text-red-50'
            }`}
            style={{
              boxShadow:
                notification.type === 'success'
                  ? '0 0 30px rgba(16, 185, 129, 0.4)'
                  : '0 0 30px rgba(239, 68, 68, 0.4)',
            }}
          >
            <p className="text-sm font-semibold whitespace-nowrap">
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasForEvent;
