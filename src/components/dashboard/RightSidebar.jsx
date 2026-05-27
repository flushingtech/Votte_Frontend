import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../api/API';
import axios from 'axios';

// ─── Up Next ──────────────────────────────────────────────────────────────────
function UpNextWidget({ events }) {
  const navigate = useNavigate();

  const toEastern = (ds) => {
    const d = new Date(new Date(ds).toLocaleString('en-US', { timeZone: 'America/New_York' }));
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const today = (() => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const upcoming = events
    .filter((e) => toEastern(e.event_date) >= today && !e.canceled)
    .sort((a, b) => toEastern(a.event_date) - toEastern(b.event_date))
    .slice(0, 3);

  const isLive = (ds) => toEastern(ds).getTime() === today.getTime();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#4B5A72' }}>
          Up Next
        </p>
        <button
          onClick={() => navigate('/upcoming-events')}
          className="text-[11px] text-blue-500/70 hover:text-blue-400 transition-colors"
        >
          View calendar →
        </button>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs py-3" style={{ color: '#2a3a52' }}>No upcoming events</p>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((ev) => {
            const d = new Date(new Date(ev.event_date).toLocaleString('en-US', { timeZone: 'America/New_York' }));
            const live = isLive(ev.event_date);
            const monthShort = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const dayNum = d.getDate();

            return (
              <button
                key={ev.id}
                onClick={() => navigate(`/event/${ev.id}`)}
                className="w-full flex items-start gap-3 text-left group"
              >
                {/* Date chip */}
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl"
                  style={{
                    width: '44px',
                    height: '48px',
                    backgroundColor: '#0a1628',
                    border: `1px solid ${live ? '#16a34a30' : '#1a2744'}`,
                  }}
                >
                  <span
                    className="text-[8px] font-bold tracking-wider"
                    style={{ color: live ? '#4ADE80' : '#3B82F6' }}
                  >
                    {monthShort}
                  </span>
                  <span
                    className="text-lg font-bold leading-none"
                    style={{ color: live ? '#4ADE80' : '#e2e8f0' }}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-white/80 leading-snug truncate group-hover:text-blue-300 transition-colors">
                    {ev.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {live ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-green-400">
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                        Live today
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: '#3a4a62' }}>
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: '#2a3a52' }}>· Online</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardWidget({ currentUserEmail }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLeaderboard().then(setBoard).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getInitials = (name, email) => {
    const b = name || (email || '').split('@')[0] || '';
    const parts = b.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return b.slice(0, 2).toUpperCase() || 'U';
  };

  const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#B45309'];
  const AVATAR_BG = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#be185d'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#4B5A72' }}>
          Leaderboard
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: '#0a1628', color: '#4B5A72', border: '1px solid #1a2744' }}
          >
            Top {Math.min(board.length, 8)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: '#0a1628' }} />
          ))}
        </div>
      ) : board.length === 0 ? (
        <p className="text-xs py-3" style={{ color: '#2a3a52' }}>No winners yet</p>
      ) : (
        <div className="space-y-1">
          {board.slice(0, 8).map((user, i) => {
            const isMe = user.email === currentUserEmail;
            const username = user.email.split('@')[0];
            const initials = getInitials(user.display_name, user.email);
            const rankColor = RANK_COLORS[i] || '#374151';
            const avatarBg = AVATAR_BG[i % AVATAR_BG.length];

            return (
              <button
                key={user.email}
                onClick={() => navigate(`/profile/${username}`)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-150 group"
                style={{
                  backgroundColor: isMe ? '#0f1e35' : 'transparent',
                  border: `1px solid ${isMe ? '#1a2e50' : 'transparent'}`,
                }}
              >
                {/* Rank */}
                <span
                  className="text-[10px] font-bold w-4 text-center flex-shrink-0"
                  style={{ color: rankColor }}
                >
                  {i + 1}
                </span>

                {/* Avatar */}
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: avatarBg }}
                >
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-bold text-white">{initials}</span>
                  )}
                </div>

                {/* Name */}
                <span
                  className="flex-1 text-xs truncate transition-colors"
                  style={{ color: isMe ? '#93C5FD' : '#64748B' }}
                >
                  {user.display_name || username}
                </span>

                {/* Wins pill */}
                <span
                  className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: '#0a1628',
                    color: '#475569',
                    border: '1px solid #1a2744',
                  }}
                >
                  {user.total_wins} {user.total_wins === 1 ? 'Win' : 'Wins'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {board.length > 0 && (
        <button
          onClick={() => navigate('/home')}
          className="w-full text-center text-[11px] mt-3 py-1.5 rounded-lg transition-colors hover:text-blue-400"
          style={{ color: '#2a3a52' }}
        >
          Full leaderboard →
        </button>
      )}
    </div>
  );
}

// ─── Latest Announcements ─────────────────────────────────────────────────────
function AnnouncementsWidget({ events }) {
  const navigate = useNavigate();

  const recent = [...events]
    .sort((a, b) => new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date))
    .slice(0, 4);

  const relTime = (ds) => {
    const diff = Date.now() - new Date(ds).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#4B5A72' }}>
          Latest Announcements
        </p>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs py-3" style={{ color: '#2a3a52' }}>Nothing yet</p>
      ) : (
        <div className="space-y-3">
          {recent.map((ev) => (
            <button
              key={ev.id}
              onClick={() => navigate(`/event/${ev.id}`)}
              className="w-full flex items-start gap-2.5 text-left group"
            >
              <div
                className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#1a3060' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] leading-snug truncate group-hover:text-gray-300 transition-colors" style={{ color: '#475569' }}>
                  {ev.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#2a3a52' }}>
                  {relTime(ev.event_date)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RightSidebar({ currentUserEmail }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/events/all-events`)
      .then((r) => setEvents(r.data.events || []))
      .catch(console.error);
  }, []);

  return (
    <aside
      className="flex-shrink-0 overflow-y-auto h-full"
      style={{
        width: '264px',
        backgroundColor: '#000000',
        borderLeft: '1px solid #111827',
      }}
    >
      <div className="flex flex-col gap-7 p-5 pt-6">
        <UpNextWidget events={events} />
        <div style={{ borderTop: '1px solid #0f1a2e' }} />
        <LeaderboardWidget currentUserEmail={currentUserEmail} />
        <div style={{ borderTop: '1px solid #0f1a2e' }} />
        <AnnouncementsWidget events={events} />
        <div className="h-4" />
      </div>
    </aside>
  );
}
