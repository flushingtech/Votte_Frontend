import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  submitIdea,
  getPreviousProjects,
  getArchivedProjects,
  addIdeaToEvent,
} from "../api/API";
import MarkdownPreviewer from "./MarkdownPreviewer";
import { cldOptimize } from "../utils/cloudinaryImage";

// Twitter/X-style inline composer: no "Add New Idea" modal to open first,
// just a "What's your idea?" box sitting at the top of the ideas feed. A
// single post replaces the old title/description split (both get set to
// the same text) and tech stack is no longer required up front — it can
// still be added later via Edit. Reusing a previous/archived project is
// still supported, as a row below the composer, but only for admins and
// hosts (canManageReuse) — regular members just get the plain composer.
function IdeaSubmission({ email, eventId, refreshIdeas, profilePicture, canManageReuse = false }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const [pickerMode, setPickerMode] = useState(null); // null | "previous" | "archived"
  const [previousProjects, setPreviousProjects] = useState([]);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [eventSpecificDescription, setEventSpecificDescription] = useState("");
  const [previousProjectsSearch, setPreviousProjectsSearch] = useState("");
  const [archivedProjectsSearch, setArchivedProjectsSearch] = useState("");
  const [pickerMessage, setPickerMessage] = useState("");
  const eventDescRef = useRef(null);

  const initial = (email || "?").charAt(0).toUpperCase();

  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    setError("");
    try {
      const response = await submitIdea(email, trimmed, trimmed, "", eventId, false, []);
      if (response.status === 201) {
        setText("");
        if (textareaRef.current) autoGrow(textareaRef.current);
        if (refreshIdeas) refreshIdeas();
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message);
      } else {
        console.error("Error submitting idea:", err);
        setError("Something went wrong posting your idea.");
      }
    } finally {
      setPosting(false);
    }
  };

  const openPreviousProjects = async () => {
    try {
      const data = await getPreviousProjects();
      setPreviousProjects(data.ideas || data);
      setPickerMode("previous");
    } catch (err) {
      console.error("Failed to load previous projects:", err);
    }
  };

  const openArchivedProjects = async () => {
    try {
      const data = await getArchivedProjects();
      setArchivedProjects(data || []);
      setPickerMode("archived");
    } catch (err) {
      console.error("Failed to load archived projects:", err);
    }
  };

  const closePicker = () => {
    setPickerMode(null);
    setSelectedProject(null);
    setEventSpecificDescription("");
    setPreviousProjectsSearch("");
    setArchivedProjectsSearch("");
    setPickerMessage("");
  };

  const handleSelectProjectToAdd = (project) => {
    setSelectedProject(project);
    setEventSpecificDescription("");
  };

  const handleConfirmAddToEvent = async (e) => {
    e.preventDefault();
    if (!eventSpecificDescription.trim()) {
      setPickerMessage("Please provide a description for this event.");
      return;
    }
    try {
      await addIdeaToEvent(
        selectedProject.id,
        eventId,
        eventSpecificDescription,
        selectedProject.technologies,
        selectedProject.is_built
      );
      if (refreshIdeas) refreshIdeas();
      closePicker();
    } catch (err) {
      console.error("Failed to add idea to event:", err);
      setPickerMessage(err.response?.data?.message || "Failed to add idea to event.");
    }
  };

  const renderProjectList = (projects, search, setSearch, accentClass) => {
    const filtered = projects.filter((project) =>
      project.idea.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-2">
        <div className="relative mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title..."
            className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                {search ? "No projects found matching your search." : "No projects available."}
              </p>
            </div>
          ) : (
            filtered.map((project) => {
              const isSameEvent = String(project.event_id) === String(eventId);
              const contributorNames = project.contributors
                ? project.contributors.split(",").map((c) => c.trim().split("@")[0]).join(", ")
                : "";

              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 bg-slate-800/30 border border-slate-600/50 rounded-lg p-2 hover:bg-slate-700/30 transition-colors"
                >
                  {project.image_url && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-slate-700">
                      <img
                        src={cldOptimize(project.image_url, { width: 100, height: 100 })}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{project.idea}</h4>
                    <p className="text-gray-400 text-xs truncate">
                      {project.event_title && project.event_date && (
                        <>{project.event_title} • {new Date(project.event_date).toLocaleDateString(undefined, { timeZone: "UTC" })}</>
                      )}
                      {project.contributors && <> • 👥 {contributorNames}</>}
                    </p>
                  </div>

                  {!isSameEvent && (
                    <button
                      onClick={() => handleSelectProjectToAdd(project)}
                      className={`${accentClass} flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap`}
                    >
                      ➕ Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl mb-2 px-2 pb-2">
      <div className="flex gap-3 px-1 pt-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {profilePicture ? (
            <img
              src={cldOptimize(profilePicture, { width: 80, height: 80 })}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            initial
          )}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autoGrow(e.target);
            }}
            placeholder="What's your idea?"
            rows={1}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none leading-snug"
          />

          <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-800">
            <button
              onClick={handlePost}
              disabled={!text.trim() || posting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-4 py-1.5 rounded-full text-sm transition-colors"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>

          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}

          {canManageReuse && (
            <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-slate-800/60">
              <button
                type="button"
                onClick={openPreviousProjects}
                title="Reuse a previous project"
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6m-19.5 0h19.5M4.5 9.75V8.25A2.25 2.25 0 016.75 6h3.879a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44H17.25A2.25 2.25 0 0119.5 9.75v0" />
                </svg>
                Previous Projects
              </button>
              <button
                type="button"
                onClick={openArchivedProjects}
                title="Reuse an archived project"
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Archived Projects
              </button>
            </div>
          )}
        </div>
      </div>

      {pickerMode && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: "2147483647", position: "fixed" }}></div>
          <div className="fixed inset-0 flex items-start justify-center p-4 pt-16 pb-8" style={{ zIndex: "2147483647", position: "fixed", isolation: "isolate" }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-4 sm:p-5 w-full max-w-3xl max-h-[88vh] overflow-y-auto">
              <button
                onClick={closePicker}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {selectedProject ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-white">Add "{selectedProject.idea}" to This Event</h3>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <p className="text-blue-200 text-sm">
                      ℹ️ Provide a description specific to what you'll work on for this event.
                    </p>
                  </div>

                  <form onSubmit={handleConfirmAddToEvent} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        📝 What will you work on for this event?
                      </label>
                      <MarkdownPreviewer textRef={eventDescRef}>
                        <textarea
                          ref={eventDescRef}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                          value={eventSpecificDescription}
                          onChange={(e) => setEventSpecificDescription(e.target.value)}
                          placeholder="Describe what you'll build or improve for this event..."
                          rows={6}
                        />
                      </MarkdownPreviewer>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(null)}
                        className="flex-1 bg-slate-700/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600/50 transition-all duration-200 border border-slate-600/50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                      >
                        ✅ Add to Event
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {pickerMode === "previous" ? "Previous Projects" : "Archived Projects (Stage 1)"}
                  </h3>
                  {pickerMode === "previous"
                    ? renderProjectList(
                        previousProjects,
                        previousProjectsSearch,
                        setPreviousProjectsSearch,
                        "bg-blue-600/50 text-blue-200 hover:bg-blue-500/50 border-blue-500/50"
                      )
                    : renderProjectList(
                        archivedProjects,
                        archivedProjectsSearch,
                        setArchivedProjectsSearch,
                        "bg-purple-600/50 text-purple-200 hover:bg-purple-500/50 border-purple-500/50"
                      )}
                </>
              )}

              {pickerMessage && (
                <div className="mt-6 p-4 rounded-lg border bg-red-600/20 border-red-500/50 text-red-300">
                  <p className="text-sm font-medium">{pickerMessage}</p>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default IdeaSubmission;
