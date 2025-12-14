import React, { useEffect, useMemo, useState } from 'react';
import { getMyProjectRequests, acceptContributorRequest, declineContributorRequest } from '../../api/API';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function ContributorRequests({ userEmail }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

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

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Contributor Requests</h2>
          <p className="text-gray-400 text-sm">Approve or decline requests to join projects</p>
        </div>
        <span className="bg-purple-600/30 text-purple-200 border border-purple-500/40 px-3 py-1 rounded-full text-sm font-semibold">
          {pendingCount} pending
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center text-gray-300 py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
          Loading requests...
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg p-4">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-gray-400 text-sm bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 text-center">
          No pending requests right now.
        </div>
      ) : (
        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border border-slate-700/60 rounded-lg p-4 bg-slate-800/40 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {(req.requester_name || req.requester_email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {req.requester_name || req.requester_email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{req.requester_email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(req.created_at)}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-200">
                <p className="font-semibold">
                  {req.idea_title} <span className="text-gray-400">·</span>{' '}
                  <span className="text-gray-300">{req.event_title}</span>
                </p>
                {req.message && (
                  <p className="text-gray-300 mt-1">"{req.message}"</p>
                )}
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => handleAction(req.id, 'accept')}
                  disabled={actioningId === req.id}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actioningId === req.id ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'decline')}
                  disabled={actioningId === req.id}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContributorRequests;
