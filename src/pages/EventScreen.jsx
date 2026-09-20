import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  getEvents,
  getEventStage,
  checkAdminStatus,
  setEventStage,
  setEventSubStage,
  setEventToResultsTime,
  determineWinners,
  getUserProfile,
  checkInToEvent,
  addContributorToIdeaEvent,
  getIdeasByEvent,
} from "../api/API";
import Navbar from "../components/Navbar";
import Sidebar from "../components/dashboard/Sidebar";
import IdeaSubmission from "../components/IdeaSubmission";
import Stage_1_Ideas from "../components/Stage_1_Ideas";
import Stage_2 from "../components/Stage_2";
import Stage_3_Ideas from "../components/Stage_3_Ideas";
import ButtonUploadEvent from "../components/ButtonUploadEvent";
import { extractEventId, createEventSlug } from "../utils/urlHelpers";
import { cldOptimize } from "../utils/cloudinaryImage";

function EventScreen() {
  const { eventId: eventSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract numeric ID from slug (handles both "123" and "123-hackathon-jan-1-2024" formats)
  const eventId = extractEventId(eventSlug);
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
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [eventProjects, setEventProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectSelection, setShowProjectSelection] = useState(false);
  const [projectSelectionDismissed, setProjectSelectionDismissed] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  // Fetch user display name
  useEffect(() => {
    const fetchUserName = async () => {
      if (email) {
        try {
          const profile = await getUserProfile(email);
          setUserName(profile.name || email.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(email.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [email]);

  // Fetch event projects for selection
  const fetchProjects = useCallback(async () => {
    if (!eventId) return;
    try {
      console.log('Fetching projects for event:', eventId);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/by-event/${eventId}`);
      const projects = response.data.ideas || [];
      console.log('Setting projects:', projects.length, 'projects');
      setEventProjects(projects);
    } catch (err) {
      console.error('Failed to fetch projects, trying fallback:', err);
      try {
        const fallbackProjects = await getIdeasByEvent(eventId);
        setEventProjects(fallbackProjects || []);
      } catch (fallbackError) {
        console.error('Fallback failed to fetch projects:', fallbackError);
        setEventProjects([]);
      }
    }
  }, [eventId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const isLiveCoding = event?.event_type === 'live_coding';

  const isUserCheckedIn = useMemo(() => {
    if (!event || !email) return false;
    return (event.checked_in || "")
      .replace(/{}/g, "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase());
  }, [email, event]);

  const userHasProjectSelection = useMemo(() => {
    if (!email) return false;
    const targetEmail = email.toLowerCase();
    const normalizeContributors = (contributorsString = "", projectOwner = "") => {
      const owner = (projectOwner || "").toLowerCase();
      return (contributorsString || "")
        .replace(/{}/g, "")
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter((c) => c && c !== owner);
    };
    return eventProjects.some((project) => {
      const ownerEmail = (
        project.email || project.owner_email || project.user_email || ""
      ).toLowerCase();
      // Owner already belongs to their own project — no need to select
      if (ownerEmail === targetEmail) return true;
      const contributors = normalizeContributors(project.contributors, ownerEmail);
      return contributors.includes(targetEmail);
    });
  }, [email, eventProjects]);

  const checkedInFlag = searchParams.get("checkedIn") === "true";

  // Single source of truth for the stage badge shown in the hero and the
  // right rail — same conditions the page already branched on, just
  // consolidated so the label/color isn't duplicated in multiple places.
  const stageBadge = useMemo(() => {
    if (isLiveCoding) {
      return eventStage === "1"
        ? { label: "Ideas Open", cls: "bg-teal-500/10 text-teal-300 border-teal-500/30" }
        : { label: "Session Complete", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" };
    }
    if (eventStage === "1" && subStage === "2") {
      return { label: "Submissions Locked", cls: "bg-orange-500/10 text-orange-300 border-orange-500/30" };
    }
    if (eventStage === "1") {
      return { label: "Submissions Open", cls: "bg-blue-500/10 text-blue-300 border-blue-500/30" };
    }
    if (eventStage === "2") {
      return { label: "Voting Time", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" };
    }
    if (eventStage === "3") {
      return { label: "Our Winners!", cls: "bg-amber-500/10 text-amber-300 border-amber-500/30" };
    }
    return { label: `Stage ${eventStage}`, cls: "bg-slate-500/10 text-slate-300 border-slate-500/30" };
  }, [isLiveCoding, eventStage, subStage]);

  // Only allow project selection in stage 1.2 or stage 2 (for hackathons only in stage 2)
  const isStageAllowingSelection =
    (eventStage === "1" && subStage === "2") ||
    (eventStage === "2" && !isLiveCoding);

  const selectionRequired =
    !userHasProjectSelection &&
    (isUserCheckedIn || checkedInFlag || !!email) &&
    isStageAllowingSelection;

  // Auto-show modal when user is checked in and has not picked projects
  useEffect(() => {
    if (!selectionRequired) {
      setProjectSelectionDismissed(false);
      setShowProjectSelection(false);
      return;
    }
    if (event && email && !loading && !projectSelectionDismissed) {
      setShowProjectSelection(true);
    }
  }, [email, event, loading, selectionRequired, projectSelectionDismissed]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const events = await getEvents();
        const eventDetails = events.find(
          (evt) => evt.id === parseInt(eventId, 10)
        );
        if (!eventDetails) throw new Error("Event not found");
        setEvent(eventDetails);

        // Check admin status first
        const isAdminStatus = await checkAdminStatus(email);
        setIsAdmin(isAdminStatus);

        // Check if event is canceled
        if (eventDetails.canceled) {
          setLoading(false);
          return; // Don't load event details, just show the canceled popup
        }

        // Update URL to proper slug format if not already
        if (eventDetails) {
          const properSlug = createEventSlug(eventDetails.id, eventDetails.title, eventDetails.event_date);

          // Only update if current URL doesn't match the proper slug
          if (eventSlug !== properSlug) {
            navigate(`/event/${properSlug}`, { replace: true });
          }
        }

        const stageData = await getEventStage(eventId);
        console.log("Initial getEventStage response:", stageData);
        const rawStage = stageData?.stage?.toString?.();
        const rawSubStage = stageData?.current_sub_stage?.toString?.();
        console.log("rawStage:", rawStage, "rawSubStage:", rawSubStage);

        setEventStage(rawStage || "1");
        setSubStage(rawSubStage || "1");

        setLoading(false);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, email, eventSlug, navigate]);

  const refreshIdeas = () => setIdeasRefreshKey((prevKey) => prevKey + 1);
  const usernameOnly = (s = "") => s.split("@")[0] || "";

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addUserToCheckedInList = () => {
    if (!email) return;
    setEvent((prev) => {
      if (!prev) return prev;
      const existing = (prev.checked_in || "")
        .replace(/{}/g, "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      const lower = existing.map((entry) => entry.toLowerCase());
      if (lower.includes(email.toLowerCase())) return prev;
      return { ...prev, checked_in: [...existing, email].join(",") };
    });
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

  const handleConfirmProjects = async () => {
    if (selectedProjects.length === 0 || !email) return;
    const projectCount = selectedProjects.length;

    try {
      if (!isUserCheckedIn) {
        try {
          await checkInToEvent(eventId, email, selectedProjects);
          addUserToCheckedInList();
        } catch (checkInErr) {
          // If already checked in (stale local state), add as contributor directly
          const msg = checkInErr?.response?.data?.message || '';
          if (msg === 'Already checked in') {
            await Promise.all(
              selectedProjects.map((projectId) =>
                addContributorToIdeaEvent(projectId, eventId, email)
              )
            );
          } else {
            throw checkInErr;
          }
        }
      } else {
        await Promise.all(
          selectedProjects.map((projectId) =>
            addContributorToIdeaEvent(projectId, eventId, email)
          )
        );
      }

      await fetchProjects();
      setShowProjectSelection(false);
      setProjectSelectionDismissed(true);
      setSelectedProjects([]);
      setNotification({
        message: `Added as contributor to ${projectCount} project${projectCount !== 1 ? 's' : ''}!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to update projects:', err);
      setNotification({ message: 'Failed to update projects', type: 'error' });
    }
  };

  const handleSkipProjects = async () => {
    if (!email) return;

    try {
      if (!isUserCheckedIn) {
        await checkInToEvent(eventId, email, []);
        addUserToCheckedInList();
      }
      setNotification({
        message: "Checked in without selecting a project",
        type: "success",
      });
    } catch (err) {
      console.error('Failed to check in without projects:', err);
      setNotification({ message: 'Failed to update check-in status', type: 'error' });
      return;
    }

    setProjectSelectionDismissed(true);
    setShowProjectSelection(false);
    setSelectedProjects([]);
  };

  const handleCancelEvent = async () => {
    if (!cancellationReason.trim()) {
      showNotification("Please provide a cancellation reason", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/cancel-event/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cancellationReason: cancellationReason.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setShowCancelConfirm(false);
        setCancellationReason('');
        // Immediately navigate to home page
        navigate('/home');
      } else {
        showNotification(data.message || "Failed to cancel event", "error");
      }
    } catch (error) {
      console.error("Error canceling event:", error);
      showNotification("Failed to cancel event", "error");
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

  // Fetch profile pictures for all participants
  useEffect(() => {
    const fetchParticipantProfiles = async () => {
      if (participants.length === 0) return;

      const profiles = {};
      await Promise.all(
        participants.map(async (participantEmail) => {
          try {
            const profile = await getUserProfile(participantEmail);
            profiles[participantEmail.toLowerCase()] = {
              name: profile.name || participantEmail.split('@')[0],
              profile_picture: profile.profile_picture || '',
            };
          } catch (error) {
            console.error(`Error fetching profile for ${participantEmail}:`, error);
            profiles[participantEmail.toLowerCase()] = {
              name: participantEmail.split('@')[0],
              profile_picture: '',
            };
          }
        })
      );
      setParticipantProfiles(profiles);
    };

    fetchParticipantProfiles();
  }, [participants]);

  const getInitials = (emailStr) => {
    const prefix = usernameOnly(emailStr);
    if (!prefix) return "•";
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    const first = parts[0]?.[0] || prefix[0];
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  const PARTICIPANTS_PREVIEW = 8;

  const EventInfoPanel = () => (
    <aside className="bg-slate-900 border border-slate-700 p-4 w-full">
      <h2 className="text-white text-sm font-bold uppercase tracking-wide mb-3">Event Info</h2>
      <div className="flex flex-col gap-2.5">
        <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border ${stageBadge.cls}`}>
          {stageBadge.label}
        </span>
        <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-2.5">
          <span className="text-slate-400">Participants</span>
          <span className="text-white font-semibold">{participants.length}</span>
        </div>
        {isUserCheckedIn && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-300 border-t border-slate-800 pt-2.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You're Checked In
          </div>
        )}
      </div>
    </aside>
  );

  const ParticipantsPanel = () => {
    const visible = showAllParticipants ? participants : participants.slice(0, PARTICIPANTS_PREVIEW);
    return (
      <aside className="bg-slate-900 border border-slate-700 w-full">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-800">
          <h2 className="text-white text-sm font-bold uppercase tracking-wide">Participants</h2>
          <span className="bg-transparent text-blue-300 border border-blue-500/30 px-2 py-0.5 text-xs font-bold">
            {participants.length}
          </span>
        </div>

        {participants.length === 0 ? (
          <p className="text-slate-500 text-sm p-3.5">No one has checked in yet.</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-800">
              {visible.map((p) => {
                const profile = participantProfiles[p.toLowerCase()];
                const uname = profile?.name || usernameOnly(p);
                const profilePic = profile?.profile_picture;
                const isYou = p.toLowerCase() === (email || "").toLowerCase();
                return (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800/60 transition-colors"
                  >
                    {profilePic ? (
                      <img
                        src={cldOptimize(profilePic, { width: 60, height: 60 })}
                        alt={uname}
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(p)}
                      </div>
                    )}
                    <p className="text-white text-sm font-medium truncate flex-1 min-w-0">
                      {uname}
                    </p>
                    {isYou && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-blue-300 flex-shrink-0">
                        You
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {participants.length > PARTICIPANTS_PREVIEW && (
              <button
                onClick={() => setShowAllParticipants((v) => !v)}
                className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-blue-400 hover:text-blue-300 border-t border-slate-800 transition-colors"
              >
                {showAllParticipants ? "Show less" : `View all ${participants.length} participants →`}
              </button>
            )}
          </>
        )}
      </aside>
    );
  };

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

    const handleCompleteSession = async () => {
      try {
        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 2 })
        });
        const data = await apiResponse.json();
        const updatedEvent = data.event || data;
        setEventStage(updatedEvent.stage.toString());
        showNotification("✅ Session completed!", "success");
      } catch (error) {
        console.error("Error completing session:", error);
        showNotification("Failed to complete session.", "error");
      }
    };

    const handleReopenSession = async () => {
      try {
        const stageResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 1 })
        });
        const stageData = await stageResponse.json();
        const updatedEvent = stageData.event || stageData;
        setEventStage(updatedEvent.stage.toString());

        await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/set-sub-stage/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sub_stage: "1" })
        });
        setSubStage("1");
        showNotification("🔓 Session reopened!", "success");
      } catch (error) {
        console.error("Error reopening session:", error);
        showNotification("Failed to reopen session.", "error");
      }
    };

    const btnPrimary = "w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 font-semibold text-xs sm:text-sm transition-colors";
    const btnNeutral = "w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-2 font-semibold text-xs sm:text-sm transition-colors";
    const btnDanger = "w-full bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-300 px-3 py-2 font-semibold text-xs sm:text-sm transition-colors";

    return (
      <aside className="bg-slate-900 border border-slate-700 p-4 flex flex-col gap-2.5 w-full">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-white text-sm font-bold uppercase tracking-wide">Admin Controls</h2>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold border ${stageBadge.cls}`}>
            {stageBadge.label}
          </span>
        </div>

        <button onClick={() => navigate('/home')} className={btnNeutral}>
          ← Back to Community
        </button>

        <hr className="border-slate-800 my-0.5" />

        {isLiveCoding ? (
          <>
            {eventStage === "1" && (
              <button onClick={handleCompleteSession} className={btnPrimary}>
                Complete Session
              </button>
            )}
            {eventStage === "2" && (
              <button onClick={handleReopenSession} className={btnNeutral}>
                Reopen Session
              </button>
            )}
          </>
        ) : (
          <>
            {eventStage === "1" && subStage === "1" && (
              <button onClick={handleToggleSubStage} className={btnPrimary}>
                Lock Submissions
              </button>
            )}

            {eventStage === "1" && subStage === "2" && (
              <>
                <button onClick={handleStartVoting} className={btnPrimary}>
                  Start Voting
                </button>
                <button onClick={handleBackToSubmissionsOpen} className={btnNeutral}>
                  Unlock Submissions
                </button>
              </>
            )}

            {eventStage === "2" && (
              <>
                <button onClick={handleShowResults} className={btnPrimary}>
                  Show Results
                </button>
                <button onClick={handleBackToSubmissionsOpen} className={btnNeutral}>
                  ← Back to Submissions
                </button>
              </>
            )}

            {eventStage === "3" && (
              <button onClick={handleBackToVoting} className={btnNeutral}>
                ← Back to Voting
              </button>
            )}
          </>
        )}

        <hr className="border-slate-800 my-0.5" />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Event Image</p>
          <ButtonUploadEvent eventId={eventId} />
        </div>

        <hr className="border-slate-800 my-0.5" />

        <button onClick={() => setShowCancelConfirm(true)} className={btnDanger}>
          Cancel Event
        </button>
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

  // Show canceled event page
  if (event?.canceled) {
    const handleUncancelEvent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events/uncancel-event/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          // Reload the page to show the uncanceled event
          window.location.reload();
        } else {
          const data = await response.json();
          alert(data.message || "Failed to uncancel event");
        }
      } catch (error) {
        console.error("Error uncanceling event:", error);
        alert("Failed to uncancel event");
      }
    };

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
        style={{ background: "#000000" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-4xl font-bold text-white mb-4">Event Canceled</h1>
          <p className="text-2xl text-gray-300 mb-6">{event.title}</p>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-red-500/50 rounded-lg p-8 mb-8">
            <p className="text-sm text-gray-400 mb-2">Cancellation Reason:</p>
            <p className="text-lg text-white">{event.cancellation_reason || 'No reason provided'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAdmin && (
              <button
                onClick={handleUncancelEvent}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-lg"
              >
                ✅ Uncancel Event
              </button>
            )}
            <button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 30%, #dbeafe 60%, #93c5fd 85%, #3b82f6 100%)' }}>

      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName || email} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto relative"
          style={{ paddingLeft: sidebarExpanded ? '220px' : '52px', transition: 'padding-left 200ms ease' }}>

          <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full">

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-3 sm:gap-4 lg:items-start">

              {/* MAIN — hero + stage content, own independent height */}
              <div className="min-w-0 flex flex-col gap-3 sm:gap-4">

                {/* HERO */}
                <div className="bg-slate-900 border border-slate-700 overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-800">
                    <button
                      onClick={() => navigate('/home')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Community
                    </button>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                          {event?.title}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(event?.event_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-bold border ${stageBadge.cls}`}>
                        {stageBadge.label}
                      </span>
                    </div>
                  </div>

                  {event?.image_url && (
                    <img
                      src={cldOptimize(event.image_url, { width: 1000 })}
                      alt="Event Banner"
                      className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  {/* CTA row: status + primary action, content-tight (no dead space) */}
                  <div className="p-3 sm:p-4 flex flex-wrap items-center gap-2">
                    {isUserCheckedIn && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                        Checked In
                      </span>
                    )}
                    {eventStage === "1" && (isLiveCoding || subStage === "1") && (
                      <div className="ml-auto">
                        <IdeaSubmission
                          email={email}
                          eventId={eventId}
                          refreshIdeas={refreshIdeas}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile only: admin/info panel sits right after the hero here.
                    Hidden on desktop, where it lives in the sticky right rail instead. */}
                <div className="lg:hidden min-w-0">
                  {isAdmin ? <AdminControlPanel /> : <EventInfoPanel />}
                </div>

                {/* STAGE CONTENT (submissions / voting / winners) */}
                <div>
                  {isLiveCoding ? (
                    <Stage_1_Ideas
                      key={ideasRefreshKey}
                      eventId={eventId}
                      refreshIdeas={refreshIdeas}
                      isAdmin={isAdmin}
                      eventStage={eventStage}
                      eventSubStage={subStage}
                      readOnly={eventStage === "2"}
                    />
                  ) : eventStage === "1" ? (
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

                {/* Mobile only: participants after the winners/stage content */}
                <div className="lg:hidden min-w-0">
                  <ParticipantsPanel />
                </div>
              </div>

              {/* Desktop only: one continuous sticky right rail — Event Info /
                  Admin Controls directly above Participants, no grid-row gap
                  between them. Starts level with the hero, not fixed, and
                  scrolls with the page once it reaches the bottom of its column. */}
              <div className="hidden lg:flex lg:flex-col gap-4 lg:sticky lg:top-6 min-w-0">
                {isAdmin ? <AdminControlPanel /> : <EventInfoPanel />}
                <ParticipantsPanel />
              </div>

            </div>
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
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl p-8 max-w-md w-full animate-slide-down">
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

      {/* Cancel Event Confirmation Modal */}
      {showCancelConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => {
              setShowCancelConfirm(false);
              setCancellationReason('');
            }}
          ></div>
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[9999]">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl p-8 max-w-md w-full animate-slide-down">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-white mb-3">Cancel Event?</h2>
                <p className="text-gray-300 text-base mb-4">
                  This will cancel the event. Please provide a reason for cancellation:
                </p>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="w-full bg-slate-700/50 text-white border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancellationReason('');
                  }}
                  className="flex-1 bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-white px-4 py-3 rounded-lg font-semibold hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-200 border border-slate-600/50"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelEvent}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg"
                  style={{
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  ❌ Cancel Event
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

      {/* Project Selection Modal */}
      {showProjectSelection && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => {
              if (selectionRequired) return;
              setShowProjectSelection(false);
              setSelectedProjects([]);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 p-6 max-w-2xl w-full shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select Your Projects</h2>
                  <p className="text-sm text-gray-400 mt-1">Choose all projects you contributed to during this event</p>
                </div>
                {!selectionRequired && (
                  <button
                    onClick={() => {
                      setShowProjectSelection(false);
                      setSelectedProjects([]);
                    }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {eventProjects.length === 0 ? (
                <>
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg mb-2">No projects found for this event</p>
                    <p className="text-gray-500 text-sm">Projects will appear here once they're submitted</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSkipProjects}
                      className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                    >
                      I didn't work on a project
                    </button>
                    {!selectionRequired && (
                      <button
                        onClick={() => {
                          setShowProjectSelection(false);
                          setSelectedProjects([]);
                        }}
                        className="w-full px-6 py-3 border border-slate-600 text-gray-400 rounded-lg font-semibold transition-all hover:border-slate-400 hover:bg-slate-700/40"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="max-h-96 overflow-y-auto space-y-2 mb-6">
                    {eventProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProjects((prev) =>
                            prev.includes(project.id)
                              ? prev.filter((id) => id !== project.id)
                              : [...prev, project.id]
                          );
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedProjects.includes(project.id)
                            ? 'bg-purple-600/20 border-purple-500 shadow-lg'
                            : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedProjects.includes(project.id)
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-slate-500'
                            }`}
                          >
                            {selectedProjects.includes(project.id) && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold">{project.idea}</h4>
                            {project.description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedProjects.length > 0 && (
                      <button
                        onClick={handleConfirmProjects}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
                      >
                        Confirm {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}
                      </button>
                    )}
                    <button
                      onClick={handleSkipProjects}
                      className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                    >
                      I didn't work on a project
                    </button>
                    <button
                      onClick={() => {
                        setShowProjectSelection(false);
                        setSelectedProjects([]);
                      }}
                      className="w-full px-6 py-3 border border-slate-600 text-gray-400 rounded-lg font-semibold transition-all hover:border-slate-400 hover:bg-slate-700/40"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EventScreen;
