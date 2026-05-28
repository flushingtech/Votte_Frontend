import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import { getFullLeaderboard, getVotesLeaderboard, getEventsLeaderboard, getUserProfile } from '../api/API';

// ─── CSS keyframes injected once ────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes lb-pulse-glow {
    0%, 100% { opacity: .5; }
    50%       { opacity: 1; }
  }
  @keyframes lb-float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes lb-streak {
    0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: .6; }
    100% { transform: translateX(250vw) skewX(-20deg); opacity: 0; }
  }
  @keyframes lb-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes lb-particle {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: .4; }
    100% { transform: translateY(-120px) translateX(30px) scale(0); opacity: 0; }
  }
  @keyframes lb-scanline {
    0%   { transform: translateY(-4px); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: .6; }
    100% { transform: translateY(calc(100vh + 4px)); opacity: 0; }
  }
  @keyframes lb-border-flow {
    0%, 100% { opacity: .3; }
    50%      { opacity: .8; }
  }
  @keyframes lb-crown-bob {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50%      { transform: translateY(-5px) rotate(5deg); }
  }
  @keyframes lb-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes lb-badge-pulse {
    0%, 100% { box-shadow: 0 0 6px 1px currentColor; }
    50%      { box-shadow: 0 0 14px 3px currentColor; }
  }
`;

// ─── Constants ───────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#7c3aed','#1d4ed8','#0891b2','#059669','#d97706','#dc2626','#be185d','#6d28d9'];

function getInitials(name, email) {
  const s = name || email || '';
  const p = s.split(' ').filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  if (p.length === 1 && p[0].length >= 2) return p[0].slice(0,2).toUpperCase();
  return ((email||'').split('@')[0].slice(0,2) || 'U').toUpperCase();
}
function avatarColor(email) {
  return AVATAR_COLORS[(email||'').charCodeAt(0) % AVATAR_COLORS.length];
}
function decodeToken(token) {
  try {
    const b = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(atob(b).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

// ─── Background ──────────────────────────────────────────────────────────────
function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-5%] left-[-5%] w-[420px] h-[420px] bg-blue-400/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-[0%] left-[15%] w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-[5%] right-[5%] w-96 h-96 bg-white/30 rounded-full blur-3xl animate-pulse" style={{animationDelay:'2s'}} />
      <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-white/25 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
      <div className="absolute bottom-[5%] right-[20%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1.5s'}} />
      <div className="absolute top-[50%] right-[5%] w-72 h-72 bg-blue-200/25 rounded-full blur-3xl animate-pulse" style={{animationDelay:'3s'}} />
    </div>
  );
}

// ─── Stat chip ───────────────────────────────────────────────────────────────
function StatChip({ label, value, icon, color, glowColor }) {
  return (
    <div className="relative flex-1 min-w-[100px] overflow-hidden group cursor-default" style={{
      background:'linear-gradient(135deg,rgba(15,23,42,.9) 0%,rgba(7,14,30,.95) 100%)',
      border:`1px solid ${color}30`,
      transition:'border-color .3s',
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor=`${color}70`}
    onMouseLeave={e=>e.currentTarget.style.borderColor=`${color}30`}
    >
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-3 h-3" style={{borderTop:`2px solid ${color}`,borderLeft:`2px solid ${color}`}}/>
      <div className="absolute bottom-0 right-0 w-3 h-3" style={{borderBottom:`2px solid ${color}`,borderRight:`2px solid ${color}`}}/>
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:`radial-gradient(ellipse at center,${glowColor}08 0%,transparent 70%)`}}/>
      <div className="px-4 py-3 relative">
        <div className="flex items-center gap-2 mb-1">
          <span style={{color}}>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:`${color}90`}}>{label}</span>
        </div>
        <div className="text-2xl font-black text-white tabular-nums" style={{textShadow:`0 0 20px ${glowColor}40`}}>
          {value ?? '—'}
        </div>
      </div>
      {/* Animated bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,transparent,${color},transparent)`,animation:'lb-border-flow 3s ease-in-out infinite'}}/>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 48, ring, glow }) {
  const bg = avatarColor(user?.email);
  const initials = getInitials(user?.display_name, user?.email);
  return (
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      {/* Spinning ring */}
      {ring && (
        <div className="absolute inset-0 rounded-full" style={{
          padding:'2px',
          background:`conic-gradient(from 0deg, transparent 30%, ${ring} 50%, transparent 70%)`,
          animation:'lb-ring-spin 3s linear infinite',
          borderRadius:'50%',
        }}/>
      )}
      {/* Glow halo */}
      {glow && <div className="absolute inset-0 rounded-full" style={{boxShadow:`0 0 20px 4px ${glow}50`,borderRadius:'50%'}}/>}
      {/* Image / initials */}
      <div className="absolute inset-[3px] rounded-full overflow-hidden" style={{border:'1px solid rgba(255,255,255,.1)'}}>
        {user?.profile_picture
          ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover"/>
          : <div className="w-full h-full flex items-center justify-center text-white font-black"
              style={{backgroundColor:bg,fontSize:size*.28}}>{initials}</div>
        }
      </div>
    </div>
  );
}

// ─── Podium ──────────────────────────────────────────────────────────────────
const PODIUM_CFG = [
  { pos: 2, rank: '🥈', label:'2ND', platformH:60, avatarSize:64, color:'#94a3b8', glow:'#94a3b8', order:0 },
  { pos: 1, rank: '👑', label:'1ST', platformH:96, avatarSize:88, color:'#f59e0b', glow:'#f59e0b', order:1 },
  { pos: 3, rank: '🥉', label:'3RD', platformH:44, avatarSize:56, color:'#cd7c3a', glow:'#cd7c3a', order:2 },
];

function PodiumCard({ cfg, user, statKey, statSuffix, extraStats }) {
  const isFirst = cfg.pos === 1;
  const value = user?.[statKey];
  return (
    <div className="flex flex-col items-center" style={{order:cfg.order, flex:'1 1 0', maxWidth:isFirst?240:180}}>
      {/* Crown / rank label */}
      <div className="mb-2 text-center">
        {isFirst
          ? <div className="text-3xl" style={{animation:'lb-crown-bob 2s ease-in-out infinite'}}>👑</div>
          : <div className="text-xs font-black tracking-widest py-1 px-3" style={{
              color:cfg.color,
              border:`1px solid ${cfg.color}40`,
              background:`${cfg.color}10`,
            }}>{cfg.label}</div>
        }
      </div>

      {/* Avatar */}
      <div style={{animation: isFirst ? 'lb-float 4s ease-in-out infinite' : undefined, marginBottom:12}}>
        <Avatar user={user} size={cfg.avatarSize} ring={cfg.color} glow={cfg.color} />
      </div>

      {/* Name block */}
      <div className="text-center mb-3 px-2 w-full">
        {user ? (
          <>
            <p className="font-black text-white truncate leading-tight" style={{fontSize:isFirst?16:13,textShadow:`0 0 12px ${cfg.color}50`}}>
              {user.display_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs mt-0.5" style={{color:`${cfg.color}80`}}>
              @{user.email?.split('@')[0]}
            </p>

            {/* Primary stat — wins */}
            <p className="font-black mt-1" style={{color:cfg.color,fontSize:isFirst?22:16,textShadow:`0 0 16px ${cfg.color}60`}}>
              {value ?? 0}
              <span className="font-normal text-xs ml-1" style={{color:`${cfg.color}70`}}>{statSuffix}</span>
            </p>

            {/* Extra stats row — votes + events */}
            {extraStats && (
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-0.5" style={{
                  background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.25)',
                }}>
                  <svg className="w-2.5 h-2.5" style={{color:'#60a5fa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                  </svg>
                  <span className="text-[10px] font-black tabular-nums" style={{color:'#60a5fa'}}>{extraStats.votes ?? 0}</span>
                  <span className="text-[9px]" style={{color:'rgba(96,165,250,.5)'}}>votes</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5" style={{
                  background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.25)',
                }}>
                  <svg className="w-2.5 h-2.5" style={{color:'#34d399'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-[10px] font-black tabular-nums" style={{color:'#34d399'}}>{extraStats.events ?? 0}</span>
                  <span className="text-[9px]" style={{color:'rgba(52,211,153,.5)'}}>events</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-600 text-xs">No data</p>
        )}
      </div>

      {/* Platform block */}
      <div className="w-full relative overflow-hidden" style={{
        height:cfg.platformH,
        background:`linear-gradient(180deg,${cfg.color}18 0%,${cfg.color}06 100%)`,
        border:`1px solid ${cfg.color}30`,
        borderBottom:'none',
      }}>
        {/* Shimmer */}
        <div className="absolute inset-0" style={{
          background:`linear-gradient(90deg,transparent 0%,${cfg.color}15 50%,transparent 100%)`,
          backgroundSize:'200% 100%',
          animation:'lb-shimmer 3s linear infinite',
        }}/>
        {/* Rank number */}
        <div className="absolute bottom-2 left-0 right-0 text-center font-black" style={{color:`${cfg.color}40`,fontSize:cfg.platformH*.5}}>
          {cfg.pos}
        </div>
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,transparent,${cfg.color},transparent)`}}/>
      </div>
    </div>
  );
}

function PodiumSection({ data, statKey, statSuffix, votesData, eventsData }) {
  const top3 = data.slice(0, 3);

  // Build lookup maps so we can cross-reference each podium user's votes + events
  const votesMap  = useMemo(() => Object.fromEntries(votesData.map(u  => [u.email, u.total_votes])),  [votesData]);
  const eventsMap = useMemo(() => Object.fromEntries(eventsData.map(u => [u.email, u.events_count])), [eventsData]);

  return (
    <div className="relative overflow-hidden" style={{
      background:'linear-gradient(180deg,rgba(7,11,22,.0) 0%,rgba(7,11,22,.6) 100%)',
      borderBottom:'1px solid rgba(139,92,246,.15)',
      paddingBottom:0,
    }}>
      {/* Section label */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4">
        <div className="h-px flex-1" style={{background:'linear-gradient(90deg,transparent,rgba(245,158,11,.4))'}}/>
        <span className="text-[10px] font-black tracking-[.3em] uppercase" style={{color:'rgba(245,158,11,.7)'}}>— Hall of Champions —</span>
        <div className="h-px flex-1" style={{background:'linear-gradient(90deg,rgba(245,158,11,.4),transparent)'}}/>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 px-4" style={{minHeight:220}}>
        {PODIUM_CFG.map(cfg => {
          const user = top3[cfg.pos - 1];
          return (
            <PodiumCard
              key={cfg.pos}
              cfg={cfg}
              user={user}
              statKey={statKey}
              statSuffix={statSuffix}
              extraStats={user ? { votes: votesMap[user.email] ?? 0, events: eventsMap[user.email] ?? 0 } : null}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Row configs ─────────────────────────────────────────────────────────────
const ROW_TIERS = [
  { bg:'rgba(245,158,11,.07)', border:'rgba(245,158,11,.35)', numColor:'#f59e0b', badgeBg:'rgba(245,158,11,.15)', badgeColor:'#fbbf24' },
  { bg:'rgba(148,163,184,.05)', border:'rgba(148,163,184,.25)', numColor:'#94a3b8', badgeBg:'rgba(148,163,184,.1)', badgeColor:'#cbd5e1' },
  { bg:'rgba(205,124,58,.06)', border:'rgba(205,124,58,.3)', numColor:'#cd7c3a', badgeBg:'rgba(205,124,58,.12)', badgeColor:'#d97706' },
];
const ROW_DEFAULT = { bg:'transparent', border:'rgba(139,92,246,.08)', numColor:'rgba(255,255,255,.2)', badgeBg:'rgba(255,255,255,.05)', badgeColor:'rgba(255,255,255,.5)' };
const MEDALS = ['🥇','🥈','🥉'];

// ─── Leaderboard panel ───────────────────────────────────────────────────────
function LeaderboardPanel({ title, subtitle, accentColor, glowColor, data, loading, statKey, statSuffix, icon }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-0 overflow-hidden" style={{
      background:'linear-gradient(160deg,rgba(10,16,32,.97) 0%,rgba(5,10,22,.99) 100%)',
      border:`1px solid ${accentColor}25`,
      position:'relative',
    }}>
      {/* Corner marks */}
      {[['top-0 left-0','borderTop','borderLeft'],['top-0 right-0','borderTop','borderRight'],
        ['bottom-0 left-0','borderBottom','borderLeft'],['bottom-0 right-0','borderBottom','borderRight']].map(([pos,a,b],i)=>(
        <div key={i} className={`absolute ${pos} w-2.5 h-2.5`} style={{[a]:`1.5px solid ${accentColor}`,[b]:`1.5px solid ${accentColor}`}}/>
      ))}

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between" style={{
        background:`linear-gradient(90deg,${accentColor}12 0%,transparent 100%)`,
        borderBottom:`1px solid ${accentColor}20`,
      }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5" style={{background:`${accentColor}20`,border:`1px solid ${accentColor}30`}}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white">{title}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{color:`${accentColor}70`}}>{subtitle}</p>
          </div>
        </div>
        <div className="text-[9px] font-black tracking-widest px-2 py-0.5" style={{
          color:accentColor, border:`1px solid ${accentColor}40`,
          background:`${accentColor}10`,
        }}>TOP 10</div>
      </div>

      {/* Glow line */}
      <div className="flex-shrink-0 h-px" style={{background:`linear-gradient(90deg,transparent,${accentColor}60,transparent)`,animation:'lb-border-flow 4s ease-in-out infinite'}}/>

      {/* Rows */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-1.5">
            {[...Array(10)].map((_,i) => (
              <div key={i} className="h-10 animate-pulse" style={{background:'rgba(255,255,255,.03)'}}/>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-slate-700">
            <span className="text-4xl mb-2">🏆</span>
            <p className="text-xs uppercase tracking-widest">No data</p>
          </div>
        ) : data.slice(0,10).map((user, idx) => {
          const tier = ROW_TIERS[idx] ?? ROW_DEFAULT;
          const username = user.email?.split('@')[0];
          const val = user[statKey];
          return (
            <div
              key={user.email}
              onClick={() => navigate(`/profile/${username}`)}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer group transition-all duration-150"
              style={{
                background: tier.bg,
                borderLeft: `2px solid ${tier.border}`,
                borderBottom:`1px solid rgba(255,255,255,.03)`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}08`; }}
              onMouseLeave={e => { e.currentTarget.style.background = tier.bg; }}
            >
              {/* Rank */}
              <div className="w-6 flex-shrink-0 text-center">
                {idx < 3
                  ? <span className="text-sm">{MEDALS[idx]}</span>
                  : <span className="text-xs font-black" style={{color:tier.numColor}}>{idx+1}</span>
                }
              </div>

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{border:`1px solid ${tier.border}`}}>
                {user.profile_picture
                  ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white"
                      style={{backgroundColor:avatarColor(user.email)}}>{getInitials(user.display_name, user.email)}</div>
                }
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-white transition-colors" style={{textShadow:idx<3?`0 0 8px ${tier.border}`:'none'}}>
                  {user.display_name || username}
                </p>
                <p className="text-[9px] truncate leading-tight" style={{color:'rgba(255,255,255,.25)'}}>@{username}</p>
              </div>

              {/* Stat */}
              <div className="flex-shrink-0 text-xs font-black px-2 py-0.5 tabular-nums" style={{
                color: tier.badgeColor, background: tier.badgeBg,
                border:`1px solid ${tier.border}`,
              }}>
                {val}<span className="font-normal opacity-50 text-[9px] ml-0.5">{statSuffix}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!loading && data.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1.5 flex items-center justify-between" style={{borderTop:`1px solid ${accentColor}15`}}>
          <span className="text-[9px] uppercase tracking-widest" style={{color:`${accentColor}50`}}>
            Showing {Math.min(data.length,10)} of {data.length}
          </span>
          <div className="h-px flex-1 mx-3" style={{background:`linear-gradient(90deg,transparent,${accentColor}30,transparent)`}}/>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [winsData,   setWinsData]   = useState([]);
  const [votesData,  setVotesData]  = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [winsLoading,   setWinsLoading]   = useState(true);
  const [votesLoading,  setVotesLoading]  = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { navigate('/', { replace: true }); return; }
    const decoded = decodeToken(token);
    const email = decoded?.email;
    if (email) {
      getUserProfile(email)
        .then(p => { setUserName(p.name||email.split('@')[0]); setProfilePicture(p.profile_picture||''); })
        .catch(() => setUserName(email.split('@')[0]));
    }
  }, [navigate]);

  useEffect(() => {
    getFullLeaderboard() .then(setWinsData)  .catch(console.error).finally(()=>setWinsLoading(false));
    getVotesLeaderboard().then(setVotesData) .catch(console.error).finally(()=>setVotesLoading(false));
    getEventsLeaderboard().then(setEventsData).catch(console.error).finally(()=>setEventsLoading(false));
  }, []);

  // Aggregate stats
  const totalBuilders = useMemo(() => {
    const set = new Set([...winsData, ...votesData, ...eventsData].map(u => u.email));
    return set.size;
  }, [winsData, votesData, eventsData]);
  const totalVotes  = useMemo(() => votesData.reduce((a,u) => a + Number(u.total_votes||0), 0), [votesData]);
  const totalEvents = useMemo(() => eventsData[0]?.events_count ?? 0, [eventsData]);
  const totalWins   = useMemo(() => winsData.reduce((a,u) => a + Number(u.total_wins||0), 0), [winsData]);

  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      <div className="flex flex-col h-screen overflow-hidden" style={{background:'linear-gradient(135deg, #ffffff 0%, #eff6ff 30%, #dbeafe 60%, #93c5fd 85%, #3b82f6 100%)'}}>

        {/* Navbar */}
        <div className="relative z-50 flex-shrink-0">
          <Navbar userName={userName} profilePicture={profilePicture} />
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <CinematicBackground />

          <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

          {/* Main scroll area */}
          <div
            className="relative flex-1 min-w-0 overflow-y-auto"
            style={{paddingLeft: sidebarExpanded ? '220px' : '52px', transition:'padding-left 200ms ease'}}
          >
            <div className="px-4 sm:px-6 pt-5 pb-6 flex flex-col gap-5 max-w-[1400px] mx-auto">

              {/* ── HEADER ─────────────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-6 w-px" style={{background:'linear-gradient(180deg,transparent,#7c3aed,transparent)'}}/>
                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
                      Leaderboard
                    </h1>
                  </div>
                  <p className="text-xs uppercase tracking-[.2em] ml-5 text-slate-500">
                    Top builders across all-time stats
                  </p>
                </div>

                {/* Stat chips */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <StatChip label="Builders" value={totalBuilders || '—'} glowColor="#a855f7" color="#a855f7"
                    icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                  />
                  <StatChip label="Total Votes" value={totalVotes || '—'} glowColor="#3b82f6" color="#3b82f6"
                    icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>}
                  />
                  <StatChip label="Events" value={eventsData.length || '—'} glowColor="#10b981" color="#10b981"
                    icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                  />
                  <StatChip label="Total Wins" value={totalWins || '—'} glowColor="#f59e0b" color="#f59e0b"
                    icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>}
                  />
                </div>
              </div>

              {/* ── PODIUM ─────────────────────────────────────────────── */}
              {!winsLoading && (
                <div style={{
                  background:'linear-gradient(160deg,rgba(10,16,35,.97) 0%,rgba(5,10,25,.99) 100%)',
                  border:'1px solid rgba(245,158,11,.15)',
                  position:'relative', overflow:'hidden',
                }}>
                  {/* Corner marks */}
                  {[['top-0 left-0','borderTop','borderLeft'],['top-0 right-0','borderTop','borderRight'],
                    ['bottom-0 left-0','borderBottom','borderLeft'],['bottom-0 right-0','borderBottom','borderRight']].map(([pos,a,b],i)=>(
                    <div key={i} className={`absolute ${pos} w-3 h-3`} style={{[a]:'1.5px solid rgba(245,158,11,.6)',[b]:'1.5px solid rgba(245,158,11,.6)'}}/>
                  ))}
                  {/* Glow behind podium */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none" style={{background:'radial-gradient(ellipse,rgba(245,158,11,.08) 0%,transparent 70%)'}}/>
                  <PodiumSection data={winsData} statKey="total_wins" statSuffix="wins" votesData={votesData} eventsData={eventsData}/>
                </div>
              )}

              {/* ── THREE PANELS ───────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{minHeight:460}}>
                <LeaderboardPanel
                  title="Hackathon Wins" subtitle="All-time victories"
                  accentColor="#f59e0b" glowColor="#f59e0b"
                  data={winsData} loading={winsLoading}
                  statKey="total_wins" statSuffix="W"
                  icon={<svg className="w-3.5 h-3.5" style={{color:'#f59e0b'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>}
                />
                <LeaderboardPanel
                  title="Total Votes" subtitle="Votes received on projects"
                  accentColor="#3b82f6" glowColor="#3b82f6"
                  data={votesData} loading={votesLoading}
                  statKey="total_votes" statSuffix="V"
                  icon={<svg className="w-3.5 h-3.5" style={{color:'#3b82f6'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>}
                />
                <LeaderboardPanel
                  title="Events Joined" subtitle="Hackathons participated"
                  accentColor="#10b981" glowColor="#10b981"
                  data={eventsData} loading={eventsLoading}
                  statKey="events_count" statSuffix="E"
                  icon={<svg className="w-3.5 h-3.5" style={{color:'#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
