import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../api/API';

const RANK_CFG = [
  {
    medal: '🥇',
    card: 'bg-gradient-to-r from-yellow-50 to-amber-50',
    border: '#F59E0B', glow: 'rgba(245,158,11,0.3)',
    badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-800',
  },
  {
    medal: '🥈',
    card: 'bg-gradient-to-r from-slate-50 to-gray-100',
    border: '#94A3B8', glow: 'rgba(148,163,184,0.25)',
    badgeBg: 'bg-slate-200', badgeText: 'text-slate-700',
  },
  {
    medal: '🥉',
    card: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: '#CD7C3A', glow: 'rgba(205,124,58,0.25)',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-800',
  },
];

const DEFAULT_CFG = {
  medal: null,
  card: 'bg-gradient-to-r from-white to-gray-50',
  border: '#CBD5E1', glow: null,
  badgeBg: 'bg-gray-100', badgeText: 'text-gray-600',
};

const AVATAR_COLORS = ['#1d4ed8','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];

const getInitials = (name, email) => {
  const basis = name || email || '';
  const parts = basis.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return ((email || '').split('@')[0].slice(0, 2) || 'U').toUpperCase();
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
          <div className="h-5 w-32 bg-slate-600 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-2 space-y-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <span className="text-4xl mb-2">🏆</span>
        <p className="text-sm">No rankings yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white">Leaderboard</h2>
        </div>
        <span className="bg-slate-600/50 px-2.5 py-0.5 rounded-full text-xs text-gray-200">Top 5</span>
      </div>

      {/* Rows — no scroll, compact */}
      <div className="flex-1 min-h-0 px-2 pt-1.5 pb-1 flex flex-col gap-1 overflow-hidden">
        {leaderboard.slice(0, 5).map((user, index) => {
          const cfg = RANK_CFG[index] ?? DEFAULT_CFG;
          const color = AVATAR_COLORS[(user.email || '').charCodeAt(0) % AVATAR_COLORS.length];

          return (
            <div
              key={user.email}
              onClick={() => navigate(`/profile/${encodeURIComponent(user.email)}`)}
              className={`${cfg.card} border-2 rounded-lg px-2.5 py-1.5 flex items-center gap-2 cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all duration-150`}
              style={{
                borderColor: cfg.border,
                boxShadow: cfg.glow ? `0 0 10px 1px ${cfg.glow}` : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Medal / rank */}
              <div className="w-6 flex-shrink-0 text-center">
                {cfg.medal
                  ? <span className="text-base leading-none">{cfg.medal}</span>
                  : <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                }
              </div>

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white shadow-sm">
                {user.profile_picture
                  ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: color }}>
                      {getInitials(user.display_name, user.email)}
                    </div>
                }
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {user.display_name || user.email?.split('@')[0]}
                </p>
                {user.project_title && (
                  <p className="text-[10px] text-gray-400 truncate leading-tight">{user.project_title}</p>
                )}
              </div>

              {/* Project image */}
              {user.project_image && (
                <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden border border-gray-200 shadow-sm">
                  <img src={user.project_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Wins */}
              <div className={`flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>
                <span className={`text-xs font-bold ${cfg.badgeText}`}>{user.total_wins}</span>
                <span className={`text-[10px] ${cfg.badgeText} opacity-60`}>{user.total_wins === 1 ? 'W' : 'W'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View full leaderboard link */}
      <div className="px-3 pt-1.5 pb-2 flex-shrink-0 text-center">
        <button
          onClick={() => navigate('/leaderboard')}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
        >
          View full leaderboard
        </button>
      </div>

    </div>
  );
};

export default Leaderboard;
