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
          className="text-[11px] transition-colors hover:text-blue-400"
          style={{ color: '#2a3a52' }}
        >
          View all →
        </button>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs py-2" style={{ color: '#2a3a52' }}>No upcoming events</p>
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
                className="w-full flex items-center gap-3 text-left group"
              >
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl"
                  style={{
                    width: '40px', height: '44px',
                    backgroundColor: '#0a1628',
                    border: `1px solid ${live ? '#16a34a30' : '#1a2744'}`,
                  }}
                >
                  <span className="text-[8px] font-bold tracking-wider" style={{ color: live ? '#4ADE80' : '#3B82F6' }}>
                    {monthShort}
                  </span>
                  <span className="text-base font-bold leading-none" style={{ color: live ? '#4ADE80' : '#e2e8f0' }}>
                    {dayNum}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug truncate group-hover:text-blue-300 transition-colors" style={{ color: '#94A3B8' }}>
                    {ev.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#2a3a52' }}>
                    {live ? '🟢 Live today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    &nbsp;· Online
                  </p>
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
  const AVATAR_COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#be185d'];

  return (
    <div>
      {loading ? (
        <div className="space-y-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 rounded-lg animate-pulse" style={{ backgroundColor: '#0a1628' }} />
          ))}
        </div>
      ) : board.length === 0 ? (
        <p className="text-xs py-2" style={{ color: '#2a3a52' }}>No winners yet</p>
      ) : (
        <div className="space-y-0.5">
          {board.slice(0, 8).map((user, i) => {
            const isMe = user.email === currentUserEmail;
            const username = user.email.split('@')[0];
            return (
              <button
                key={user.email}
                onClick={() => navigate(`/profile/${username}`)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all group"
                style={{
                  backgroundColor: isMe ? '#0f1e35' : 'transparent',
                  border: `1px solid ${isMe ? '#1a2e50' : 'transparent'}`,
                }}
              >
                <span className="text-[10px] font-bold w-4 text-center flex-shrink-0" style={{ color: RANK_COLORS[i] || '#374151' }}>
                  {i + 1}
                </span>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {user.profile_picture
                    ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[8px] font-bold text-white">{getInitials(user.display_name, user.email)}</span>
                  }
                </div>
                <span className="flex-1 text-xs truncate transition-colors" style={{ color: isMe ? '#93C5FD' : '#64748B' }}>
                  {user.display_name || username}
                </span>
                <span className="text-[10px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#0a1628', color: '#475569', border: '1px solid #1a2744' }}>
                  {user.total_wins} {user.total_wins === 1 ? 'Win' : 'Wins'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Latest Announcements ─────────────────────────────────────────────────────
function AnnouncementsWidget({ events }) {
  const navigate = useNavigate();

  const recent = [...events]
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 4);

  const relTime = (ds) => {
    const d = Math.floor((Date.now() - new Date(ds)) / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#4B5A72' }}>
        Latest Announcements
      </p>
      {recent.length === 0 ? (
        <p className="text-xs py-2" style={{ color: '#2a3a52' }}>Nothing yet</p>
      ) : (
        <div className="space-y-2.5">
          {recent.map((ev) => (
            <button key={ev.id} onClick={() => navigate(`/event/${ev.id}`)} className="w-full flex items-start gap-2 text-left group">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1a3060' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] leading-snug truncate group-hover:text-gray-300 transition-colors" style={{ color: '#475569' }}>
                  {ev.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#2a3a52' }}>{relTime(ev.event_date)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Combined widget column (used next to Upcoming Events) ────────────────────
export { LeaderboardWidget };

export default function DashboardWidgets({ currentUserEmail }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/events/all-events`)
      .then((r) => setEvents(r.data.events || []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Up Next */}
      <div
        className="p-5 rounded-2xl"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid #1a2744' }}
      >
        <UpNextWidget events={events} />
      </div>

      {/* Leaderboard */}
      <div
        className="p-5 rounded-2xl mt-3"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid #1a2744' }}
      >
        <LeaderboardWidget currentUserEmail={currentUserEmail} />
      </div>

      {/* Latest Announcements */}
      <div
        className="p-5 rounded-2xl mt-3"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid #1a2744' }}
      >
        <AnnouncementsWidget events={events} />
      </div>
    </div>
  );
}
