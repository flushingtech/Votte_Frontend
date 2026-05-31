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
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600 flex-shrink-0" style={{ height: 46 }} />
      <div style={{ flex: 1, minHeight: 0, padding: '10px 12px', display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '1fr', gap: 10 }}>
        {[0,1,2,3].map(i =>
          <div key={i} className="animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />)}
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

  const go = (ideaId, eventId) => navigate(`/idea/${ideaId}`, { state: { eventId } });

  const ROOT = {
    background: 'linear-gradient(160deg,#050c1b 0%,#070d1e 58%,#060a18 100%)',
    display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    position: 'relative',
  };

  if (loading) return <LoadingSkeleton />;

  const total = projects.length;

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

      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600" style={{ position: 'relative', zIndex: 2 }}>
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-white">Featured Projects</h2>
        </div>
        <span className="bg-slate-600/50 px-2.5 py-0.5 rounded-full text-xs text-gray-200">
          {total} project{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Responsive grid — 2 cols on mobile, 3 on md, 4 on lg+ */}
      <div style={{ flex: 1, minHeight: 0, padding: '10px 12px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style={{ height: '100%', gridAutoRows: '1fr' }}>
          {projects.map(p => {
            const contributors = p.contributors?.length > 0
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
                  position: 'relative', overflow: 'hidden', minHeight: 120,
                  border: '1px solid rgba(51,65,85,.5)', background: '#0f172a',
                  cursor: 'pointer', transition: 'border-color 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,.55)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(139,92,246,.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,.5)';    e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Full-bleed image */}
                {p.image_url
                  ? <img src={p.image_url} alt={p.idea}
                      className="group-hover:scale-105 transition-transform duration-500"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ position: 'absolute', inset: 0 }}><NoImg sm /></div>
                }

                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(15,23,42,.04) 0%, rgba(15,23,42,.3) 40%, rgba(15,23,42,.92) 72%, rgba(15,23,42,.99) 100%)' }} />

                {/* Content pinned to bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p className="group-hover:text-blue-300 transition-colors"
                    style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: 12, lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.idea}
                  </p>

                  {p.awards?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {p.awards.map(a => <Badge key={a} award={a} />)}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                    borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 5 }}>
                    <AvatarStack contributors={contributors} max={4} dim={18} />
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
