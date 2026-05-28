import { useEffect, useState } from 'react';
import { getFeaturedProjects } from '../api/API';
import { useNavigate } from 'react-router-dom';

const ROTATE_MS = 5500;
const FADE_MS   = 400;

// ─── Award palette ───────────────────────────────────────────────────────────
const AWARD_CFG = {
  'Hackathon Winner': { emoji:'🏆', label:'Hackathon Winner', glow:'#f59e0b', color:'#fbbf24', border:'rgba(245,158,11,.52)',  bg:'rgba(245,158,11,.09)'  },
  'Most Creative':    { emoji:'🎨', label:'Most Creative',    glow:'#a855f7', color:'#c084fc', border:'rgba(168,85,247,.52)',  bg:'rgba(168,85,247,.09)'  },
  'Most Technical':   { emoji:'⚡', label:'Most Technical',   glow:'#06b6d4', color:'#22d3ee', border:'rgba(6,182,212,.52)',   bg:'rgba(6,182,212,.09)'   },
  'Most Impactful':   { emoji:'🌍', label:'Most Impactful',   glow:'#10b981', color:'#34d399', border:'rgba(16,185,129,.52)',  bg:'rgba(16,185,129,.09)'  },
  'Better Design':    { emoji:'✦',  label:'Better Design',    glow:'#ec4899', color:'#f472b6', border:'rgba(236,72,153,.52)',  bg:'rgba(236,72,153,.09)'  },
  'Most Innovative':  { emoji:'🚀', label:'Most Innovative',  glow:'#8b5cf6', color:'#a78bfa', border:'rgba(139,92,246,.52)',  bg:'rgba(139,92,246,.09)'  },
  'Best Technical':   { emoji:'💻', label:'Best Technical',   glow:'#06b6d4', color:'#22d3ee', border:'rgba(6,182,212,.52)',   bg:'rgba(6,182,212,.09)'   },
  'Best Educational': { emoji:'📚', label:'Best Educational', glow:'#10b981', color:'#34d399', border:'rgba(16,185,129,.52)',  bg:'rgba(16,185,129,.09)'  },
};
const FB_AWARD = { emoji:'🏅', label:'Award', glow:'#94a3b8', color:'#cbd5e1', border:'rgba(148,163,184,.52)', bg:'rgba(148,163,184,.09)' };


// ─── Avatar helpers ───────────────────────────────────────────────────────────
const PAL = ['#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777'];
const aCol = email => PAL[(email||'').charCodeAt(0) % PAL.length];

// ─── Global CSS ──────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes fp-float {
    0%,100%{ transform:translateY(0)   }
    50%    { transform:translateY(-2.5px) }
  }
  @keyframes fp-glow-pulse {
    0%,100%{ opacity:.88 }
    50%    { opacity:1   }
  }
  @keyframes fp-ring {
    0%,100%{ box-shadow:0 0 0 1.5px rgba(139,92,246,.55),0 0 8px  rgba(139,92,246,.22) }
    50%    { box-shadow:0 0 0 1.5px rgba(139,92,246,.92),0 0 18px rgba(139,92,246,.42) }
  }
  @keyframes fp-scan {
    0%   { top:-2px; opacity:0   }
    5%   { opacity:.22            }
    95%  { opacity:.22            }
    100% { top:100%; opacity:0   }
  }
  @keyframes fp-dot-pulse {
    0%,100%{ transform:scale(1)    }
    50%    { transform:scale(1.22) }
  }
  @keyframes fp-hero-breathe {
    0%,100%{ box-shadow:0 0 0 1px rgba(139,92,246,.18),0 0 28px rgba(139,92,246,.07),0 10px 36px rgba(0,0,0,.55) }
    50%    { box-shadow:0 0 0 1px rgba(139,92,246,.38),0 0 42px rgba(139,92,246,.12),0 10px 36px rgba(0,0,0,.55) }
  }
  .fp-hero {
    cursor:pointer;
    transition:box-shadow 240ms ease;
  }
  .fp-hero:hover {
    box-shadow:0 0 0 1px rgba(139,92,246,.72),0 0 50px rgba(139,92,246,.16),0 18px 46px rgba(0,0,0,.65) !important;
    animation:none !important;
  }
  .fp-sm {
    cursor:pointer;
    transition:transform 175ms ease,box-shadow 175ms ease,border-color 175ms ease;
  }
  .fp-sm:hover {
    transform:translateY(-2px);
  }
  .fp-sm:hover .fp-sm-img {
    transform:scale(1.05);
  }
  .fp-sm-img {
    transition:transform 300ms ease;
    width:100%; height:100%; object-fit:cover; display:block;
  }
  .fp-btn {
    cursor:pointer;
    transition:background 175ms ease,color 175ms ease,box-shadow 175ms ease;
  }
  .fp-btn:hover {
    background:rgba(139,92,246,.15) !important;
    color:#c084fc !important;
    box-shadow:0 0 12px rgba(139,92,246,.28);
  }
  @media (max-width:900px) {
    .fp-main-grid {
      grid-template-columns:1fr !important;
      overflow-y:auto !important;
    }
  }
  @media (max-height:600px) {
    .fp-hero-img { height:44% !important; min-height:100px !important; }
  }
  @media (max-height:480px) {
    .fp-hero-img { height:36% !important; min-height:80px !important; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarBubble({ email, pic, name, dim = 26, animDelay = 0 }) {
  const ini = (name || email || 'U').split('@')[0].slice(0, 2).toUpperCase();
  const col = aCol(email);
  const shared = {
    width: dim, height: dim, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid rgba(139,92,246,.5)',
    animation: `fp-ring 3.2s ease-in-out ${animDelay}s infinite`,
  };
  return pic
    ? <img src={pic} alt={ini} title={name || email?.split('@')[0]}
        style={{ ...shared, objectFit: 'cover' }} />
    : <div style={{
        ...shared, background: col,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: Math.floor(dim * .36),
      }}>{ini}</div>;
}

function AvatarStack({ contributors = [], max = 5, dim = 26 }) {
  if (!contributors.length) return null;
  const vis  = contributors.slice(0, max);
  const more = contributors.length - max;
  const neg  = Math.floor(dim * -.3);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {vis.map((c, i) => (
        <div key={c.email || i} style={{ marginLeft: i ? neg : 0, zIndex: max - i }}>
          <AvatarBubble email={c.email} pic={c.profile_picture} name={c.name} dim={dim} animDelay={i * .35} />
        </div>
      ))}
      {more > 0 && (
        <div style={{
          width: dim, height: dim, borderRadius: '50%', marginLeft: neg, zIndex: 0,
          background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', fontWeight: 700, fontSize: Math.floor(dim * .28), flexShrink: 0,
        }}>+{more}</div>
      )}
    </div>
  );
}

// Floating glowing ribbon (hero card)
function Ribbon({ award, delay = 0 }) {
  const c = AWARD_CFG[award] || FB_AWARD;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
      boxShadow: `0 0 10px ${c.glow}55, 0 0 26px ${c.glow}22`,
      animation: `fp-float 3.5s ease-in-out ${delay}s infinite, fp-glow-pulse 3.5s ease-in-out ${delay}s infinite`,
    }}>
      <span style={{ fontSize: 12 }}>{c.emoji}</span>{c.label}
    </div>
  );
}

// Compact badge (small cards)
function Badge({ award }) {
  const c = AWARD_CFG[award] || FB_AWARD;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 6px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontSize: 8, fontWeight: 700, letterSpacing: '.05em',
      boxShadow: `0 0 7px ${c.glow}38`,
    }}>
      <span style={{ fontSize: 9 }}>{c.emoji}</span>{c.label}
    </div>
  );
}

// Large cinematic award chip (hero card)
function HeroAward({ award, delay = 0 }) {
  const c = AWARD_CFG[award] || FB_AWARD;
  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex', alignItems: 'center', gap: 9,
      padding: '8px 16px',
      background: `linear-gradient(135deg, ${c.bg}, rgba(0,0,0,.18))`,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
      boxShadow: `0 0 18px ${c.glow}55, 0 0 40px ${c.glow}20, inset 0 0 24px ${c.glow}0a`,
      animation: `fp-float 3.8s ease-in-out ${delay}s infinite, fp-glow-pulse 3.8s ease-in-out ${delay}s infinite`,
    }}>
      {/* Corner brackets */}
      <span style={{ position:'absolute', top:3,  left:3,  width:9, height:1, background:c.color, opacity:.55 }} />
      <span style={{ position:'absolute', top:3,  left:3,  width:1, height:9, background:c.color, opacity:.55 }} />
      <span style={{ position:'absolute', bottom:3, right:3, width:9, height:1, background:c.color, opacity:.55 }} />
      <span style={{ position:'absolute', bottom:3, right:3, width:1, height:9, background:c.color, opacity:.55 }} />
      <span style={{ fontSize: 18, lineHeight: 1 }}>{c.emoji}</span>
      {c.label}
    </div>
  );
}

function VotePill({ count, lg = false }) {
  if (count == null) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg style={{ width: lg ? 13 : 10, height: lg ? 13 : 10, stroke: '#a78bfa', strokeWidth: lg ? 2.5 : 2 }}
        fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
      </svg>
      <span style={{ fontSize: lg ? 12 : 10, fontWeight: 700, color: '#c4b5fd', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </span>
      <span style={{ fontSize: lg ? 9 : 8, color: 'rgba(148,163,184,.42)' }}>votes</span>
    </div>
  );
}

function NoImg({ sm }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#060d1e 0%,#0a1428 100%)',
    }}>
      <svg style={{ width: sm ? 22 : 34, height: sm ? 22 : 34, stroke: 'rgba(255,255,255,.09)' }}
        fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
      </svg>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const ROOT = {
    background: 'linear-gradient(160deg,#050c1b 0%,#070d1e 60%,#060a18 100%)',
    display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
  };
  return (
    <div style={ROOT}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {/* header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600 flex-shrink-0" style={{ height: 46 }} />
      {/* grid */}
      <div style={{ flex: 1, padding: '10px 12px', display: 'grid',
        gridTemplateColumns: '3fr 2fr', gap: 10 }}>
        <div className="animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr', gap: 8 }}>
          {[0,1,2,3].map(i =>
            <div key={i} className="animate-pulse" style={{ background: 'rgba(255,255,255,.03)' }} />)}
        </div>
      </div>
      {/* footer */}
      <div style={{ height: 34, borderTop: '1px solid rgba(255,255,255,.05)',
        background: 'rgba(255,255,255,.012)', flexShrink: 0 }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [idx,      setIdx]      = useState(0);
  const [visible,  setVisible]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProjects()
      .then(d => setProjects(Array.isArray(d) ? d : (d?.projects || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (projects.length < 2) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % projects.length); setVisible(true); }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [projects.length]);

  const go = (ideaId, eventId) => navigate(`/idea/${ideaId}`, { state: { eventId } });

  if (loading) return <LoadingSkeleton />;

  const total    = projects.length;
  const featured = projects[idx] || {};
  const rest     = total > 1 ? [1,2,3,4].map(n => projects[(idx + n) % total]) : [];

  const ROOT = {
    background: 'linear-gradient(160deg,#050c1b 0%,#070d1e 58%,#060a18 100%)',
    display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    position: 'relative',
  };

  if (!total) return (
    <div style={{ ...ROOT, alignItems: 'center', justifyContent: 'center' }}>
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

      {/* ── Ambient glow blobs ── */}
      <div style={{
        position: 'absolute', top: '8%', left: '3%', width: '32%', height: '55%',
        background: 'radial-gradient(ellipse,rgba(139,92,246,.08) 0%,transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '18%', width: '22%', height: '35%',
        background: 'radial-gradient(ellipse,rgba(6,182,212,.06) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600" style={{ position: 'relative', zIndex: 2 }}>
        {/* Left: icon + title */}
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-white">Featured Projects</h2>
        </div>

        {/* Right: dots + count */}
        <div className="flex items-center gap-3">
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              {projects.map((_, i) => (
                <button key={i}
                  onClick={() => {
                    setVisible(false);
                    setTimeout(() => { setIdx(i); setVisible(true); }, FADE_MS);
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === idx ? '16px' : '6px',
                    height: '6px',
                    backgroundColor: i === idx ? '#60A5FA' : '#334155',
                  }}
                />
              ))}
            </div>
          )}
          <span className="bg-slate-600/50 px-2.5 py-0.5 rounded-full text-xs text-gray-200">
            {total} project{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="fp-main-grid" style={{
        flex: 1, minHeight: 0, padding: '10px 12px', gap: 10, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '3fr 2fr',
        position: 'relative', zIndex: 1,
      }}>

        {/* ══════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════ */}
        <div
          className="fp-hero"
          onClick={() => go(featured.id, featured.event_id)}
          style={{
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'linear-gradient(160deg,rgba(139,92,246,.058) 0%,rgba(6,182,212,.025) 100%)',
            border: '1px solid rgba(139,92,246,.28)',
            animation: 'fp-hero-breathe 4.5s ease-in-out infinite',
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          {/* Image region */}
          <div className="fp-hero-img" style={{ position: 'relative', flexShrink: 0, height: '52%', minHeight: 130, overflow: 'hidden' }}>
            {featured.image_url
              ? <img src={featured.image_url} alt={featured.idea}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <NoImg />
            }

            {/* Cinematic gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom,rgba(5,12,27,.06) 0%,transparent 30%,rgba(5,12,27,.94) 100%)',
            }} />

            {/* Corner accent lines */}
            <div style={{ position:'absolute', top:0, left:0, width:18, height:1,  background:'rgba(139,92,246,.6)' }} />
            <div style={{ position:'absolute', top:0, left:0, width:1,  height:18, background:'rgba(139,92,246,.6)' }} />
            <div style={{ position:'absolute', top:0, right:0, width:18, height:1, background:'rgba(139,92,246,.6)' }} />
            <div style={{ position:'absolute', top:0, right:0, width:1, height:18, background:'rgba(139,92,246,.6)' }} />


            {/* Scan line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 1, top: 0,
              background: 'linear-gradient(to right,transparent 0%,rgba(139,92,246,.55) 50%,transparent 100%)',
              animation: 'fp-scan 6s linear infinite',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Content region */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px 14px', gap: 6, minHeight: 0, overflow: 'hidden' }}>

            {/* Title + subtitle */}
            <div style={{ flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: 14.5,
                lineHeight: 1.28, letterSpacing: '.01em' }}>
                {featured.idea}
              </h3>
              {featured.event_title && (
                <p style={{ margin: '3px 0 0', color: 'rgba(167,139,250,.6)', fontSize: 10, fontWeight: 600 }}>
                  {featured.event_title}
                </p>
              )}
            </div>

            {/* Description — max 3 lines, shrinks first when space is tight */}
            <p style={{
              margin: 0, flexShrink: 1, minHeight: 0,
              color: 'rgba(148,163,184,.72)', fontSize: 11, lineHeight: 1.7,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
              {featured.description}
            </p>

            {/* Awards — large cinematic chips below description */}
            {featured.awards?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
                {featured.awards.map((a, i) => <HeroAward key={a} award={a} delay={i * 0.5} />)}
              </div>
            )}

            {/* Hairline divider */}
            <div style={{
              height: 1, flexShrink: 0,
              background: 'linear-gradient(to right,transparent,rgba(255,255,255,.08),transparent)',
            }} />

            {/* Footer: contributors left, votes right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
              <AvatarStack
                contributors={
                  featured.contributors?.length > 0
                    ? featured.contributors
                    : (featured.profile_picture || featured.contributor_name)
                      ? [{ email: featured.email, name: featured.contributor_name, profile_picture: featured.profile_picture }]
                      : []
                }
                max={5} dim={26}
              />
              <VotePill count={featured.vote_count} lg />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            2 × 2 SMALL CARDS
        ══════════════════════════════════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr', gap: 8,
        }}>
          {[0, 1, 2, 3].map(i => {
            const p = rest[i];
            if (!p) return (
              <div key={`e-${i}`} style={{ background: 'rgba(15,23,42,.4)', border: '1px solid rgba(51,65,85,.4)' }} />
            );
            const smContributors = p.contributors?.length > 0
              ? p.contributors
              : (p.profile_picture || p.contributor_name)
                ? [{ email: p.email, name: p.contributor_name, profile_picture: p.profile_picture }]
                : [];
            return (
              <div
                key={p.id}
                onClick={() => go(p.id, p.event_id)}
                className="group"
                style={{
                  position: 'relative', overflow: 'hidden',
                  border: '1px solid rgba(51,65,85,.5)', background: '#0f172a',
                  cursor: 'pointer', transition: 'border-color 200ms ease',
                }}
              >
                  {/* Full-bleed image */}
                  {p.image_url
                    ? <img src={p.image_url} alt={p.idea}
                        className="group-hover:scale-105 transition-transform duration-500"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ position: 'absolute', inset: 0 }}><NoImg sm /></div>
                  }

                  {/* Cinematic gradient — heavy at the bottom so text is always readable */}
                  <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(15,23,42,.04) 0%, rgba(15,23,42,.25) 35%, rgba(15,23,42,.88) 68%, rgba(15,23,42,.98) 100%)' }} />

                  {/* Content pinned to bottom */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <p className="group-hover:text-blue-300 transition-colors"
                      style={{
                        margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: 13, lineHeight: 1.3,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                      {p.idea}
                    </p>

                    <p style={{
                      margin: 0, color: 'rgba(148,163,184,.82)', fontSize: 9, lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {p.description}
                    </p>

                    {/* Awards */}
                    {p.awards?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {p.awards.map(a => <Badge key={a} award={a} />)}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                      borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 5,
                    }}>
                      <AvatarStack contributors={smContributors} max={4} dim={18} />
                      <VotePill count={p.vote_count} />
                    </div>
                  </div>
                </div>
              );
          })}
        </div>
      </div>

    </div>
  );
}
