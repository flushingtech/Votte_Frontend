import { useEffect, useState, useMemo, useCallback } from "react";
import { getContributedIdeas } from "../api/API";
import { useNavigate } from "react-router-dom";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

function MyIdeas({ email }) {
  const [contributedIdeas, setContributedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchContributedIdeas = async () => {
      try {
        const contributed = await getContributedIdeas(email);
        if (mounted) setContributedIdeas(Array.isArray(contributed) ? contributed : []);
      } catch (err) {
        console.error("Error fetching contributed ideas:", err);
        if (mounted) setError("Failed to load contributed ideas");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (email) fetchContributedIdeas();
    return () => { mounted = false; };
  }, [email]);

  const handleIdeaClick = useCallback(
    (ideaId) => {
      if (ideaId) navigate(`/idea/${ideaId}`);
      else console.error("Idea ID is undefined.");
    },
    [navigate]
  );

  return (
    <section className="my-ideas-section relative flex h-full flex-col">
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: "#1E2A3A", borderColor: "white" }}
      >
        <div className="mx-0 flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold tracking-wide text-white">
            My Projects
          </span>
          {/* count pill */}
          <span className="rounded-full border border-white/40 px-2 py-0.5 text-[10px] font-semibold text-white/90">
            {loading ? "…" : contributedIdeas.length}
          </span>
        </div>
        {/* subtle glow stripe */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 35%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>

      {/* Body */}
      <div className="overflow-y-auto pt-2" style={{ maxHeight: "30vh" }}>
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => window.location.reload()} />
        ) : contributedIdeas.length === 0 ? (
          <EmptyState />
        ) : (
          <IdeaList ideas={contributedIdeas} onOpen={handleIdeaClick} />
        )}
      </div>
    </section>
  );
}

function IdeaList({ ideas, onOpen }) {
  return (
    <ul className="space-y-2 px-2">
      {ideas.map((idea) => (
        <li key={idea.id}>
          <IdeaRow idea={idea} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

function IdeaRow({ idea, onOpen }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(idea.id);
    }
  };

  // Optional fields: event_title, created_at, votes, contributors, stage, etc.
  const chips = [
    idea.stage ? { label: `Stage ${idea.stage}` } : null,
    Number.isFinite(idea.votes) ? { label: `${idea.votes} votes` } : null,
    Array.isArray(idea.contributors)
      ? { label: `${idea.contributors.length} contributors` }
      : null,
    idea.event_title ? { label: idea.event_title } : null,
  ].filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(idea.id)}
      onKeyDown={handleKey}
      className={[
        "group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-white/95",
        "transition-all duration-200 ease-out",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,.12)] focus:outline-none",
      ].join(" ")}
      style={{ borderColor: "#1E2A3A" }}
    >
      {/* top row */}
      <div className="flex items-start gap-3 p-3">
        {/* bullet / accent */}
        <div
          className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: "#1E2A3A" }}
        />
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-bold text-black"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
              maxWidth: "100%",
            }}
            title={idea.idea}
          >
            {idea.idea}
          </h3>

          {/* description */}
          <div
            className="mt-1 text-xs text-gray-700"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
              maxWidth: "100%",
            }}
          >
            <MarkdownWithPlugins className="text-xs">
              {idea.description}
            </MarkdownWithPlugins>
          </div>

          {/* chips */}
          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-gray-700 transition-colors group-hover:border-gray-800 group-hover:text-gray-900"
                  style={{ borderColor: "#cbd5e1" }}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* “View” chevron button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(idea.id);
          }}
          className="ml-2 inline-flex items-center gap-1.5 self-start rounded-md border px-2 py-1 text-[11px] font-semibold text-white transition-all hover:translate-x-[1px] active:translate-x-0"
          style={{ backgroundColor: "#000", borderColor: "#666" }}
          aria-label="View idea"
        >
          View
          <svg
            className="h-[14px] w-[14px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* bottom accent line */}
      <div
        className="h-[3px] w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, rgba(30,42,58,0) 0%, rgba(30,42,58,.8) 50%, rgba(30,42,58,0) 100%)",
        }}
      />
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2 px-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="rounded-xl border bg-white/90 p-3" style={{ borderColor: "#1E2A3A" }}>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#1E2A3A" }} />
            <div className="w-full">
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="mx-2 rounded-xl border bg-white p-4 text-left shadow-sm" style={{ borderColor: "#1E2A3A" }}>
      <div className="flex items-start gap-3">
        {/* Simple “spark” icon */}
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1E2A3A"
          strokeWidth="1.5"
        >
          <path d="M12 2l1.8 5.3L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.7L12 2z" />
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-black">No contributed ideas yet</h3>
          <p className="mt-1 text-xs text-gray-700">
            Ideas where you’re listed as a contributor will appear here. Ask a teammate to add your email, or submit a new idea to kick things off.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="mx-2 rounded-xl border border-red-300 bg-red-50 p-4 text-left">
      <h3 className="text-sm font-semibold text-red-700">Something went wrong</h3>
      <p className="mt-1 text-xs text-red-600">{message}</p>
      <button
        className="mt-2 rounded-md border px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}

export default MyIdeas;
