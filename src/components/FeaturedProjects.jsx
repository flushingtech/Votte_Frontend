import { useEffect, useState } from 'react';
import { getFeaturedProjects } from '../api/API';
import { useNavigate } from 'react-router-dom';

const ROTATE_MS = 5000;
const FADE_MS   = 400;

const FeaturedProjects = () => {
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [visible, setVisible]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate: fade out → swap → fade in
  useEffect(() => {
    if (projects.length < 2) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIdx(i => (i + 1) % projects.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [projects.length]);

  const handleClick = (ideaId, eventId) => {
    navigate(`/idea/${ideaId}`, { state: { eventId } });
  };

  const total    = projects.length;
  const featured = projects[activeIdx];
  const rest     = total > 1
    ? [1, 2, 3, 4].map(offset => projects[(activeIdx + offset) % total])
    : [];

  const AVATAR_COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
  const Avatar = ({ email, profilePicture, name, size = 'sm' }) => {
    const initials = (name || email || 'U').split('@')[0].slice(0, 2).toUpperCase();
    const color = AVATAR_COLORS[(email || '').charCodeAt(0) % AVATAR_COLORS.length];
    const dim = size === 'lg' ? 'w-7 h-7 text-xs' : 'w-5 h-5 text-[9px]';
    return profilePicture
      ? <img src={profilePicture} alt={initials} className={`${dim} rounded-full object-cover ring-1 ring-black/30`} />
      : <div className={`${dim} rounded-full flex items-center justify-center font-bold text-white ring-1 ring-black/30`}
          style={{ backgroundColor: color }}>{initials}</div>;
  };

  const NoImage = ({ sm }) => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/60">
      <svg className={sm ? 'w-6 h-6 text-slate-700' : 'w-10 h-10 text-slate-700'}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    </div>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="h-4 w-32 bg-slate-800 rounded mb-3 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-h-0 grid gap-3 grid-cols-1 lg:grid-cols-2">
          <div className="bg-slate-800/60 rounded-none animate-pulse min-h-[260px] lg:min-h-0" />
          <div className="grid grid-cols-2 gap-3 grid-rows-2 min-h-[260px] lg:min-h-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800/60 rounded-none animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-slate-600">
        <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="text-sm">No featured projects yet</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header + dot indicators */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white">Featured Projects</h2>
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setActiveIdx(i); setVisible(true); }, FADE_MS); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === activeIdx ? '16px' : '6px',
                  height: '6px',
                  backgroundColor: i === activeIdx ? '#60A5FA' : '#334155',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Outer grid: 1 col on mobile, 2 col on desktop */}
      <div className="flex-1 min-h-0 grid gap-3 grid-cols-1 lg:grid-cols-2">

        {/* ── Big featured card ── */}
        <div
          onClick={() => handleClick(featured.id, featured.event_id)}
          className="flex flex-col overflow-hidden rounded-none border border-slate-700/50 bg-slate-900 cursor-pointer group hover:border-slate-500/60 transition-all min-h-[260px] lg:min-h-0"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        >
          {/* Fixed-height image */}
          <div className="relative flex-shrink-0 overflow-hidden h-40 lg:h-1/2">
            {featured.image_url
              ? <img src={featured.image_url} alt={featured.idea}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              : <NoImage />
            }
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded
              bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 tracking-wider uppercase">
              Featured
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-3 min-h-0">
            <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
              <Avatar email={featured.email} profilePicture={featured.profile_picture} name={featured.contributor_name} size="lg" />
              <span className="text-xs text-slate-500 truncate">{featured.contributor_name || featured.email?.split('@')[0]}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2
              group-hover:text-blue-300 transition-colors mb-1 flex-shrink-0">
              {featured.idea}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-3 flex-1 leading-relaxed">
              {featured.description}
            </p>
          </div>
        </div>

        {/* ── 2×2 small cards ── */}
        <div className="grid grid-cols-2 gap-3 min-h-[260px] lg:min-h-0 lg:h-full"
          style={{ gridTemplateRows: '1fr 1fr' }}>
          {[...Array(4)].map((_, i) => {
            const p = rest[i];
            if (!p) return (
              <div key={`e-${i}`} className="rounded-none border border-slate-800/40 bg-slate-900/20" />
            );
            return (
              <div
                key={p.id}
                onClick={() => handleClick(p.id, p.event_id)}
                className="flex flex-col overflow-hidden rounded-none border border-slate-700/50 bg-slate-900
                  cursor-pointer group hover:border-slate-500/60 transition-all"
              >
                {/* Image */}
                <div className="relative flex-shrink-0 overflow-hidden h-16 lg:h-2/5">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.idea}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <NoImage sm />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 px-2 py-1.5 min-h-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-shrink-0">
                    <Avatar email={p.email} profilePicture={p.profile_picture} name={p.contributor_name} size="sm" />
                    <span className="text-[9px] text-slate-600 truncate">{p.contributor_name || p.email?.split('@')[0]}</span>
                  </div>
                  <p className="text-xs font-medium text-white leading-snug line-clamp-1
                    group-hover:text-blue-300 transition-colors flex-shrink-0">
                    {p.idea}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 flex-1 mt-0.5">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FeaturedProjects;
