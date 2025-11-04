import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEvents,
  getEventStage,
  checkAdminStatus,
  setEventStage,
  setEventSubStage,
  setEventToResultsTime,
  determineWinners,
} from "../api/API";
import Navbar from "../components/Navbar";
import IdeaSubmission from "../components/IdeaSubmission";
import Stage_1_Ideas from "../components/Stage_1_Ideas";
import Stage_2 from "../components/Stage_2";
import Stage_3_Ideas from "../components/Stage_3_Ideas";
import ButtonUploadEvent from "../components/ButtonUploadEvent";

function EventScreen() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState(null);
  const [eventStage, setEventStage] = useState("1");
  const [subStage, setSubStage] = useState("1");
  const [ideasRefreshKey, setIdeasRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResultsConfirm, setShowResultsConfirm] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const events = await getEvents();
        const eventDetails = events.find(
          (evt) => evt.id === parseInt(eventId, 10)
        );
        if (!eventDetails) throw new Error("Event not found");
        setEvent(eventDetails);

        const stageData = await getEventStage(eventId);
        console.log("Initial getEventStage response:", stageData);
        const rawStage = stageData?.stage?.toString?.();
        const rawSubStage = stageData?.current_sub_stage?.toString?.();
        console.log("rawStage:", rawStage, "rawSubStage:", rawSubStage);

        setEventStage(rawStage || "1");
        setSubStage(rawSubStage || "1");

        const isAdminStatus = await checkAdminStatus(email);
        setIsAdmin(isAdminStatus);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, email]);

  const refreshIdeas = () => setIdeasRefreshKey((prevKey) => prevKey + 1);
  const usernameOnly = (s = "") => s.split("@")[0] || "";

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmShowResults = async () => {
    setShowResultsConfirm(false);
    try {
      const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-results-time/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await apiResponse.json();
      const updatedEvent = data.event || data;
      setEventStage(updatedEvent.stage.toString());
      showNotification("🏆 Results are now live!", "success");
    } catch (error) {
      console.error("Error showing results:", error);
      showNotification("Failed to show results.", "error");
    }
  };

  const participants = useMemo(() => {
    const raw = (event?.checked_in || "")
      .replace(/{}/g, "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(raw));
    unique.sort((a, b) => usernameOnly(a).localeCompare(usernameOnly(b)));
    return unique;
  }, [event]);

  const getInitials = (emailStr) => {
    const prefix = usernameOnly(emailStr);
    if (!prefix) return "•";
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    const first = parts[0]?.[0] || prefix[0];
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  const ParticipantsPanel = () => (
    <aside className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl border border-purple-700/50 shadow-2xl p-4 w-full max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-lg font-bold">Participants</h2>
        <span className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/50">
          {participants.length}
        </span>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 text-sm">No one has checked in yet.</p>
      ) : (
        <ul className="participants-scroll space-y-2 flex-1 overflow-auto pr-1">
          {participants.map((p) => {
            const uname = usernameOnly(p);
            const isYou = p.toLowerCase() === (email || "").toLowerCase();
            return (
              <li
                key={p}
                className="flex items-center justify-between gap-3 px-3 py-3 bg-purple-800/20 rounded-lg border border-purple-700/30 hover:bg-purple-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 text-sm font-bold shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white shadow-lg">
                    {getInitials(p)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {uname}
                    </p>
                    {isYou && (
                      <span className="bg-blue-600/50 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/50">
                        You
                      </span>
                    )}
                  </div>
                </div>
                {isYou && (
                  <span
                    className="bg-green-600/50 text-green-200 text-xs font-bold px-2 py-1 rounded-lg border border-green-500/50"
                    title="Checked in"
                  >
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );

  const AdminControlPanel = () => {
    const handleToggleSubStage = async () => {
      try {
        const newSubStage = subStage === "1" ? "2" : "1";

        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-sub-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sub_stage: newSubStage })
        });

        const data = await apiResponse.json();
        console.log("Toggle substage response:", data);
        const updatedEvent = data.event || data;
        console.log("updatedEvent:", updatedEvent);
        console.log("updatedEvent.current_sub_stage:", updatedEvent.current_sub_stage);

        setSubStage(updatedEvent.current_sub_stage || newSubStage);
        showNotification(`Event is now in Sub-Stage ${newSubStage === "1" ? "1.1 (Open)" : "1.2 (Locked)"}`, "success");
      } catch (error) {
        console.error("Error toggling sub-stage:", error);
        showNotification("Failed to toggle event sub-stage.", "error");
      }
    };

    const handleStartVoting = async () => {
      try {
        console.log("Starting voting for eventId:", eventId);

        // Call API directly to see full response
        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 2 })
        });

        console.log("API response status:", apiResponse.status);
        const data = await apiResponse.json();
        console.log("API response data:", data);

        // Extract event from response
        const updatedEvent = data.event || data;
        console.log("updatedEvent:", updatedEvent);

        if (!updatedEvent || updatedEvent.stage === undefined) {
          console.error("Invalid response structure. Full data:", data);
          alert("Failed to start voting - invalid response from server");
          return;
        }

        console.log("Setting stage to:", updatedEvent.stage);
        setEventStage(updatedEvent.stage.toString());
        showNotification("🗳️ Voting has started!", "success");
      } catch (error) {
        console.error("Error starting voting:", error);
        showNotification("Failed to start voting. Check console for details.", "error");
      }
    };

    const handleBackToSubmissionsOpen = async () => {
      try {
        // First set to Stage 1
        const stageResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 1 })
        });
        const stageData = await stageResponse.json();
        const updatedEvent = stageData.event || stageData;
        setEventStage(updatedEvent.stage.toString());

        // Then set to SubStage 1
        const subStageResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-sub-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sub_stage: "1" })
        });
        const subStageData = await subStageResponse.json();
        const updatedEventSubStage = subStageData.event || subStageData;

        console.log("SubStage response:", updatedEventSubStage);
        console.log("Setting substage to:", updatedEventSubStage.current_sub_stage);

        setSubStage(updatedEventSubStage.current_sub_stage || "1");
        showNotification("📝 Back to Open Submissions!", "success");
      } catch (error) {
        console.error("Error moving back to Open Submissions:", error);
        showNotification("Failed to move back to Open Submissions.", "error");
      }
    };

    const handleBackToVoting = async () => {
      try {
        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 2 })
        });
        const data = await apiResponse.json();
        const updatedEvent = data.event || data;
        setEventStage(updatedEvent.stage.toString());
        showNotification("🗳️ Back to Voting!", "success");
      } catch (error) {
        console.error("Error moving back to voting:", error);
        showNotification("Failed to move back to voting.", "error");
      }
    };

    const handleShowResults = () => {
      setShowResultsConfirm(true);
    };

    return (
      <aside className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-xl border border-orange-700/50 shadow-2xl p-2 sm:p-3 lg:p-4 flex flex-col gap-2 lg:gap-3 w-full">
        {/* Stacked, no-wrap header */}
        <div className="flex flex-col items-start mb-1 lg:mb-2">
          <h2 className="text-white text-sm sm:text-base font-bold whitespace-nowrap mb-1">
            ⚙️ Admin Controls
          </h2>
          <span className="bg-orange-600/50 text-orange-200 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold border border-orange-500/50">
            Stage {eventStage}{eventStage === "1" && `.${subStage}`}
          </span>
        </div>

        {/* Stage 1.1 controls */}
        {eventStage === "1" && subStage === "1" && (
          <button
            onClick={handleToggleSubStage}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-lg text-xs sm:text-sm"
          >
            🔒 Lock
          </button>
        )}

        {/* Stage 1.2 controls */}
        {eventStage === "1" && subStage === "2" && (
          <>
            <button
              onClick={handleStartVoting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-lg text-xs sm:text-sm"
            >
              🗳️ Voting
            </button>
            <button
              onClick={handleBackToSubmissionsOpen}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-3 lg:py-2 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg text-xs"
            >
              🔓 Unlock
            </button>
          </>
        )}

        {/* Stage 2 controls */}
        {eventStage === "2" && (
          <>
            <button
              onClick={handleShowResults}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg text-xs sm:text-sm"
            >
              🏆 Results
            </button>
            <button
              onClick={handleBackToSubmissionsOpen}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-3 lg:py-2 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg text-xs"
            >
              ← Back
            </button>
          </>
        )}

        {/* Stage 3 controls */}
        {eventStage === "3" && (
          <button
            onClick={handleBackToVoting}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 shadow-lg text-xs sm:text-sm"
          >
            ← Back
          </button>
        )}

        {/* Divider + Upload */}
        <hr className="border-slate-600/40 my-1 lg:my-2" />
        <div className="transform scale-90 sm:scale-95">
          <ButtonUploadEvent eventId={eventId} />
        </div>
      </aside>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F1419]">
        <p>Loading event details...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-[#0F1419]">
        {error}
      </div>
    );

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{
        background:
          "linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)",
      }}
    >
      <Navbar userName={email} backToHome={true} />

      <div className="flex-1 px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <div className="relative max-w-6xl mx-auto">
          {/* ONE GRID: top-aligned header+admin (no extra gap), then ideas row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 items-start">
            {/* HEADER (cols 1–4) */}
            <div className="lg:col-span-4 relative">
              <button
                onClick={() => navigate(-1)}
                className="absolute -left-12 top-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg hidden lg:block"
                title="Go back"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl p-3 sm:p-4 lg:p-6 xl:p-8 overflow-hidden">
                <h1 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white mb-1 sm:mb-2 lg:mb-3">
                  {event?.title}
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm lg:text-base xl:text-lg mb-3 sm:mb-4 lg:mb-6">
                  {new Date(event?.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {event?.image_url && (
                  <div className="mb-3 sm:mb-4 lg:mb-6">
                    <img
                      src={event.image_url}
                      alt="Event Banner"
                      className="w-full h-32 sm:h-40 lg:h-56 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-6 sm:mb-8 lg:mb-12">
                  {eventStage === "1" && subStage === "1" && (
                    <span className="bg-blue-600/50 text-blue-200 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm border border-blue-500/50">
                      📝 Submissions Open
                    </span>
                  )}
                  {eventStage === "1" && subStage === "2" && (
                    <span className="bg-orange-600/50 text-orange-200 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm border border-orange-500/50">
                      🔒 Submissions Locked
                    </span>
                  )}
                  {eventStage === "2" && (
                    <span className="bg-green-600/50 text-green-200 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm border border-green-500/50">
                      🗳️ Voting Time
                    </span>
                  )}
                  {eventStage === "3" && (
                    <span className="bg-yellow-600/50 text-yellow-200 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm border border-yellow-500/50">
                      🏆 Our Winners!
                    </span>
                  )}
                  {(event?.checked_in || "")
                    .split(",")
                    .map((e) => e.trim())
                    .includes(email) && (
                      <span className="bg-emerald-600/50 text-emerald-200 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm border border-emerald-500/50">
                        ✅ Checked In
                      </span>
                    )}
                </div>

                {/* Add New Idea inside header, bottom-right */}
                {eventStage === "1" && subStage === "1" && (
                  <div className="absolute bottom-4 right-4">
                    <IdeaSubmission
                      email={email}
                      eventId={eventId}
                      refreshIdeas={refreshIdeas}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ADMIN (col 5) */}
            {isAdmin && (
              <div className="lg:col-span-1">
                {/* self-start ensures no extra vertical stretch */}
                <div className="sticky top-6 self-start" style={{ zIndex: 20 }}>
                  <AdminControlPanel />
                </div>
              </div>
            )}

            {/* IDEAS (cols 1–3) */}
            <div className="lg:col-span-3">
              {eventStage === "1" ? (
                <Stage_1_Ideas
                  key={ideasRefreshKey}
                  eventId={eventId}
                  refreshIdeas={refreshIdeas}
                  isAdmin={isAdmin}
                  eventStage={eventStage}
                  eventSubStage={subStage}
                />
              ) : eventStage === "2" ? (
                <Stage_2 key={ideasRefreshKey} eventId={eventId} />
              ) : eventStage === "3" ? (
                <Stage_3_Ideas key={ideasRefreshKey} eventId={eventId} />
              ) : (
                <p className="text-white text-center">
                  Unknown event stage: {eventStage}
                </p>
              )}
            </div>

            {/* PARTICIPANTS (col 4) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ParticipantsPanel />
              </div>
            </div>

            {/* SPACER (col 5) to mirror admin column below */}
            <div className="hidden lg:block lg:col-span-1" />
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
              notification.type === "success"
                ? "bg-gradient-to-br from-green-600/90 to-emerald-600/90 border-green-500/50 text-green-50"
                : "bg-gradient-to-br from-red-600/90 to-rose-600/90 border-red-500/50 text-red-50"
            }`}
            style={{
              boxShadow: notification.type === "success"
                ? "0 0 30px rgba(16, 185, 129, 0.4)"
                : "0 0 30px rgba(239, 68, 68, 0.4)",
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
}

export default EventScreen;
