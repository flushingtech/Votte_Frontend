import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProjectRequests, acceptContributorRequest, declineContributorRequest } from '../../api/API';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

function ContributorRequests({ userEmail }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    if (!userEmail) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProjectRequests(userEmail);
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching contributor requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleAction = async (requestId, action) => {
    if (!userEmail) return;
    setActioningId(requestId);
    try {
      if (action === 'accept') {
        await acceptContributorRequest(requestId, userEmail);
      } else {
        await declineContributorRequest(requestId, userEmail);
      }
      await fetchRequests();
    } catch (err) {
      console.error(`Error processing request ${action}:`, err);
      setError(`Failed to ${action} request`);
    } finally {
      setActioningId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mb-4"></div>
        <p className="text-gray-400">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={fetchRequests}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
        <p className="text-gray-400">No pending contributor requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{requests.length}</span> request{requests.length !== 1 ? 's' : ''}
        </p>
        {pendingCount > 0 && (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Requests list */}
      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-4 hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              {/* Profile picture */}
              {req.requester_picture ? (
                <img
                  src={req.requester_picture}
                  alt={req.requester_name || req.requester_email}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-700 flex-shrink-0">
                  {(req.requester_name || req.requester_email || '?').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">
                    {req.requester_name || req.requester_email?.split('@')[0]}
                  </span>
                  <span className="text-gray-500">wants to join</span>
                  <button
                    onClick={() => navigate(`/idea/${req.idea_id}`)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline truncate"
                  >
                    {req.idea_title}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span className="text-gray-400">{req.event_title}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">{formatDate(req.created_at)}</span>
                </div>
                {req.message && (
                  <p className="text-gray-400 text-sm mt-2 italic">"{req.message}"</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(req.id, 'accept')}
                  disabled={actioningId === req.id}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {actioningId === req.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>✓</span>
                      <span className="hidden sm:inline">Accept</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'decline')}
                  disabled={actioningId === req.id}
                  className="bg-slate-700/50 hover:bg-red-600/80 border border-slate-600/50 hover:border-red-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span>✕</span>
                  <span className="hidden sm:inline">Decline</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContributorRequests;
