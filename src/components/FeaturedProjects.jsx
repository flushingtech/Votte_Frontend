import { useEffect, useState } from 'react';
import { getFeaturedProjects } from '../api/API';
import { useNavigate } from 'react-router-dom';
import { cldOptimize } from '../utils/cloudinaryImage';

// ─── Award palette ───────────────────────────────────────────────────────────
const AWARD_CFG = {
  'Hackathon Winner': { emoji:'🏆', label:'Hackathon Winner', color:'#fbbf24', border:'rgba(245,158,11,.5)',  bg:'rgba(245,158,11,.08)'  },
  'Most Creative':    { emoji:'🎨', label:'Most Creative',    color:'#c084fc', border:'rgba(168,85,247,.5)',  bg:'rgba(168,85,247,.08)'  },
  'Most Technical':   { emoji:'⚡', label:'Most Technical',   color:'#22d3ee', border:'rgba(6,182,212,.5)',   bg:'rgba(6,182,212,.08)'   },
  'Most Impactful':   { emoji:'🌍', label:'Most Impactful',   color:'#34d399', border:'rgba(16,185,129,.5)',  bg:'rgba(16,185,129,.08)'  },
  'Better Design':    { emoji:'✦',  label:'Better Design',    color:'#f472b6', border:'rgba(236,72,153,.5)',  bg:'rgba(236,72,153,.08)'  },
  'Most Innovative':  { emoji:'🚀', label:'Most Innovative',  color:'#a78bfa', border:'rgba(139,92,246,.5)',  bg:'rgba(139,92,246,.08)'  },
  'Best Technical':   { emoji:'💻', label:'Best Technical',   color:'#22d3ee', border:'rgba(6,182,212,.5)',   bg:'rgba(6,182,212,.08)'   },
  'Best Educational': { emoji:'📚', label:'Best Educational', color:'#34d399', border:'rgba(16,185,129,.5)',  bg:'rgba(16,185,129,.08)'  },
};
const FB_AWARD = { emoji:'🏅', label:'Award', color:'#cbd5e1', border:'rgba(148,163,184,.5)', bg:'rgba(148,163,184,.08)' };

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const PAL = ['#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777'];
const aCol = email => PAL[(email||'').charCodeAt(0) % PAL.length];

// ─── Global CSS ──────────────────────────────────────────────────────────────
const STYLES = `
  .fp-card, .fp-feed-card {
    cursor:pointer;
    transition:border-color 150ms ease;
  }
  .fp-card:hover, .fp-feed-card:hover {
    border-color:rgba(59,130,246,.55) !important;
  }
  .fp-card-img {
    width:100%; height:100%; object-fit:cover; display:block;
  }
  .fp-viewall {
    cursor:pointer;
    transition:color 150ms ease;
    background:none; border:none; padding:0;
  }
  .fp-viewall:hover { color:#93c5fd !important; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarBubble({ email, pic, name, dim = 22 }) {
  const ini = (name || email || 'U').split('@')[0].slice(0, 2).toUpperCase();
  const col = aCol(email);
  const shared = {
    width: dim, height: dim, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #0f172a',
  };
  return pic
    ? <img src={cldOptimize(pic, { width: 80, height: 80 })} alt={ini} title={name || email?.split('@')[0]} loading="lazy" decoding="async"
        style={{ ...shared, objectFit: 'cover' }} />
    : <div style={{
        ...shared, background: col,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: Math.floor(dim * .38),
      }}>{ini}</div>;
}

function AvatarStack({ contributors = [], max = 4, dim = 22 }) {
  if (!contributors.length) return null;
  const vis  = contributors.slice(0, max);
  const more = contributors.length - max;
  const neg  = Math.floor(dim * -.35);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {vis.map((c, i) => (
        <div key={c.email || i} style={{ marginLeft: i ? neg : 0, zIndex: max - i }}>
          <AvatarBubble email={c.email} pic={c.profile_picture} name={c.name} dim={dim} />
        </div>
      ))}
      {more > 0 && (
        <div style={{
          width: dim, height: dim, borderRadius: '50%', marginLeft: neg, zIndex: 0,
          background: '#1e293b', border: '1.5px solid #0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', fontWeight: 700, fontSize: Math.floor(dim * .3), flexShrink: 0,
        }}>+{more}</div>
      )}
    </div>
  );
}

// Small outlined award badge
function Badge({ award, size = 'sm' }) {
  const c = AWARD_CFG[award] || FB_AWARD;
  const lg = size === 'lg';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: lg ? 4 : 3,
      padding: lg ? '3px 8px' : '2px 6px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontSize: lg ? 10 : 8.5, fontWeight: 700, letterSpacing: '.03em',
      borderRadius: 0, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: lg ? 11 : 9.5 }}>{c.emoji}</span>{c.label}
    </div>
  );
}

// Tech stack pill
function TechPill({ label, size = 'sm' }) {
  const lg = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: lg ? '3px 9px' : '2px 6px',
      fontSize: lg ? 11 : 9, fontWeight: 600,
      color: '#93c5fd', background: 'rgba(59,130,246,.08)',
      border: '1px solid rgba(59,130,246,.25)', borderRadius: 0,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// Vote count corner chip, overlaid on the image
function VoteChip({ count, size = 'sm' }) {
  if (count == null) return null;
  const lg = size === 'lg';
  return (
    <div style={{
      position: 'absolute', top: lg ? 10 : 6, right: lg ? 10 : 6,
      display: 'flex', alignItems: 'center', gap: 3,
      padding: lg ? '4px 8px' : '2px 5px',
      background: 'rgba(15,23,42,.72)', backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,.14)', borderRadius: 0,
      color: '#e2e8f0', fontSize: lg ? 11 : 9, fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
    }}>
      <svg style={{ width: lg ? 11 : 8, height: lg ? 11 : 8, stroke: '#a78bfa', strokeWidth: 2.5 }}
        fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
      </svg>
      {count}
    </div>
  );
}

function NoImg({ lg }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0a1226 0%,#0d1830 100%)',
    }}>
      <svg style={{ width: lg ? 34 : 20, height: lg ? 34 : 20, stroke: 'rgba(255,255,255,.1)' }}
        fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
      </svg>
    </div>
  );
}

const getContributors = (p) => p.contributors?.length > 0
  ? p.contributors
  : (p.profile_picture || p.contributor_name)
    ? [{ email: p.email, name: p.contributor_name, profile_picture: p.profile_picture }]
    : [];

const getTechs = (p) => (p.technologies || '').split(',').map(t => t.trim()).filter(Boolean);

// ─── Desktop / tablet grid card ───────────────────────────────────────────────
function ProjectCard({ project: p, navigate }) {
  const contributors = getContributors(p);
  const techs = getTechs(p);
  const visibleTechs = techs.slice(0, 3);
  const moreTechs = techs.length - visibleTechs.length;

  return (
    <div
      className="fp-card"
      onClick={() => navigate(`/idea/${p.id}`, { state: { eventId: p.event_id } })}
      style={{
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(51,65,85,.55)', background: '#0f172a',
        borderRadius: 0, overflow: 'hidden', height: '100%',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', flexShrink: 0, overflow: 'hidden' }}>
        {p.image_url
          ? <img src={cldOptimize(p.image_url, { width: 500 })} alt={p.idea} className="fp-card-img" loading="lazy" decoding="async" />
          : <NoImg />
        }
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,23,42,0) 45%, rgba(15,23,42,.75) 78%, rgba(15,23,42,.97) 100%)' }} />
        <VoteChip count={p.vote_count} />

        {/* Title + awards pinned to the bottom of the image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 10px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ margin: 0, color: '#f8fafc', fontWeight: 800, fontSize: 12.5, lineHeight: 1.25,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {p.idea}
          </p>
          {p.awards?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {p.awards.map(a => <Badge key={a} award={a} />)}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: 10 }}>
        {p.description && (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {p.description}
          </p>
        )}

        {visibleTechs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {visibleTechs.map(t => <TechPill key={t} label={t} />)}
            {moreTechs > 0 && (
              <span style={{ fontSize: 9.5, color: 'rgba(148,163,184,.55)', alignSelf: 'center' }}>+{moreTechs}</span>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
          borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 7 }}>
          <AvatarStack contributors={contributors} max={4} dim={20} />
          {contributors.length > 0 && (
            <span style={{ fontSize: 10, color: 'rgba(148,163,184,.65)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile: compact horizontal feed row ──────────────────────────────────────
function FeedCard({ project: p, navigate }) {
  const contributors = getContributors(p);
  const techs = getTechs(p);
  const visibleTechs = techs.slice(0, 2);
  const moreTechs = techs.length - visibleTechs.length;
  const visibleAwards = (p.awards || []).slice(0, 2);
  const moreAwards = (p.awards?.length || 0) - visibleAwards.length;

  return (
    <div
      className="fp-feed-card"
      onClick={() => navigate(`/idea/${p.id}`, { state: { eventId: p.event_id } })}
      style={{
        display: 'flex', border: '1px solid rgba(51,65,85,.55)', background: '#0f172a',
        borderRadius: 0, overflow: 'hidden',
      }}
    >
      {/* Thumbnail — ~38% of card width */}
      <div style={{ position: 'relative', width: '38%', flexShrink: 0, aspectRatio: '1 / 1', overflow: 'hidden' }}>
        {p.image_url
          ? <img src={cldOptimize(p.image_url, { width: 300, height: 300 })} alt={p.idea} className="fp-card-img" loading="lazy" decoding="async" />
          : <NoImg />
        }
        <VoteChip count={p.vote_count} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        <p style={{ margin: 0, color: '#f8fafc', fontWeight: 800, fontSize: 12.5, lineHeight: 1.25,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
          {p.idea}
        </p>

        {visibleAwards.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {visibleAwards.map(a => <Badge key={a} award={a} />)}
            {moreAwards > 0 && <span style={{ fontSize: 9, color: 'rgba(148,163,184,.55)', alignSelf: 'center' }}>+{moreAwards}</span>}
          </div>
        )}

        {p.description && (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 10.5, lineHeight: 1.35,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {p.description}
          </p>
        )}

        {visibleTechs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {visibleTechs.map(t => <TechPill key={t} label={t} />)}
            {moreTechs > 0 && <span style={{ fontSize: 9, color: 'rgba(148,163,184,.55)', alignSelf: 'center' }}>+{moreTechs}</span>}
          </div>
        )}

        {contributors.length > 0 && (
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 3 }}>
            <AvatarStack contributors={contributors} max={3} dim={16} />
            <span style={{ fontSize: 9.5, color: 'rgba(148,163,184,.65)', fontWeight: 500 }}>
              {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const ROOT = {
    background: 'linear-gradient(160deg,#050c1b 0%,#070d1e 60%,#060a18 100%)',
    display: 'flex', flexDirection: 'column',
  };
  return (
    <div style={ROOT}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600 flex-shrink-0" style={{ height: 46 }} />
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4" style={{ padding: 14, gap: 14 }}>
        {[0,1,2,3].map(i =>
          <div key={i} className="animate-pulse" style={{ background: 'rgba(255,255,255,.04)', borderRadius: 0, aspectRatio: '16 / 13' }} />)}
      </div>
      <div className="flex md:hidden flex-col" style={{ gap: 12, padding: 14 }}>
        {[0,1].map(i =>
          <div key={i} className="animate-pulse" style={{ background: 'rgba(255,255,255,.04)', borderRadius: 0, height: 100 }} />)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProjects()
      .then(d => setProjects(Array.isArray(d) ? d : (d?.projects || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // No fixed height / overflow here — this section grows to fit its content
  // and the dashboard's outer column is the only thing that scrolls.
  const ROOT = {
    background: 'linear-gradient(160deg,#050c1b 0%,#070d1e 58%,#060a18 100%)',
    display: 'flex', flexDirection: 'column',
  };

  if (loading) return <LoadingSkeleton />;

  const total = projects.length;
  const desktopProjects = projects.slice(0, 4);

  if (!total) return (
    <div style={{ ...ROOT, alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <svg style={{ width: 36, height: 36, stroke: 'rgba(148,163,184,.25)', marginBottom: 10 }}
        fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
      <p style={{ color: 'rgba(148,163,184,.35)', fontSize: 12, margin: 0 }}>No featured projects yet</p>
    </div>
  );

  return (
    <div style={ROOT}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Header */}
      <div className="px-3 sm:px-4 py-3 flex-shrink-0 flex items-center justify-between gap-2 flex-wrap bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-purple-500 p-1.5 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
            </svg>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white whitespace-nowrap truncate">Featured Projects</h2>
        </div>
        <button type="button" className="fp-viewall flex-shrink-0 whitespace-nowrap" style={{ color: '#60a5fa', fontSize: 12.5, fontWeight: 600 }}>
          View all projects →
        </button>
      </div>

      {/* Desktop / tablet: curated grid, up to 4 cards, all the same height */}
      <div className="hidden md:block" style={{ padding: 14 }}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4" style={{ gap: 14 }}>
          {desktopProjects.map(p => (
            <ProjectCard key={p.id} project={p} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* Mobile: compact vertical feed — natural page scroll, no carousel */}
      <div className="flex md:hidden flex-col" style={{ gap: 12, padding: 14 }}>
        {projects.map(p => (
          <FeedCard key={p.id} project={p} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
