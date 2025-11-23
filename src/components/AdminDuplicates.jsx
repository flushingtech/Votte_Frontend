import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDuplicateIdeas, mergeIdeas, checkAdminStatus } from '../api/API';
import Navbar from './Navbar';

function AdminDuplicates() {
  const navigate = useNavigate();
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    const verifyAdminAndFetch = async () => {
      try {
        const adminStatus = await checkAdminStatus(userEmail);
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          setMessage('Admin access required');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        await fetchDuplicates();
      } catch (error) {
        console.error('Error verifying admin:', error);
        setMessage('Error verifying admin status');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      verifyAdminAndFetch();
    } else {
      navigate('/');
    }
  }, [userEmail, navigate]);

  const fetchDuplicates = async () => {
    try {
      const groups = await getDuplicateIdeas();
      setDuplicateGroups(groups);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      setMessage('Failed to load duplicates');
    }
  };

  const handleSelectIdea = (ideaId) => {
    setSelectedIdeas(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleMerge = async () => {
    if (selectedIdeas.length < 2) {
      setMessage('Select at least 2 ideas to merge');
      return;
    }

    if (!confirm(`Are you sure you want to merge ${selectedIdeas.length} ideas? This cannot be undone.`)) {
      return;
    }

    try {
      const result = await mergeIdeas(selectedIdeas, userEmail);
      setMessage(`✅ Successfully merged ${result.mergedCount} ideas!`);
      setSelectedIdeas([]);
      setSelectedGroup(null);
      await fetchDuplicates();
    } catch (error) {
      console.error('Error merging ideas:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage(`❌ Failed to merge ideas: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-red-400 text-xl">Access Denied: Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Merge Duplicate Ideas</h1>
            <p className="text-gray-400">Find and merge duplicate project submissions across events</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.includes('Success') || message.includes('merged')
                ? 'bg-green-900/20 border-green-500/50 text-green-300'
                : 'bg-red-900/20 border-red-500/50 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {duplicateGroups.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
              <p className="text-gray-400 text-lg">No duplicate ideas found! 🎉</p>
              <p className="text-gray-500 text-sm mt-2">All ideas are unique or already merged.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {duplicateGroups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{group.title}</h2>
                      <p className="text-gray-400 text-sm">{group.count} duplicate entries found</p>
                    </div>
                    {selectedGroup === groupIdx && selectedIdeas.length >= 2 && (
                      <button
                        onClick={handleMerge}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
                      >
                        Merge Selected ({selectedIdeas.length})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.ideas.map((idea) => (
                      <div
                        key={idea.id}
                        className={`bg-slate-700/30 rounded-lg border p-4 cursor-pointer transition-all ${
                          selectedIdeas.includes(idea.id)
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-slate-600/50 hover:border-slate-500'
                        }`}
                        onClick={() => {
                          setSelectedGroup(groupIdx);
                          handleSelectIdea(idea.id);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-base mb-1 line-clamp-2">{idea.idea}</h3>
                            <p className="text-gray-400 text-xs">
                              📅 {idea.event_date ? new Date(idea.event_date).toLocaleDateString() : 'No date'}
                            </p>
                            {idea.event_title && (
                              <p className="text-gray-500 text-xs mt-1">{idea.event_title}</p>
                            )}
                            <p className="text-gray-600 text-xs mt-1">ID: {idea.id}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedIdeas.includes(idea.id)}
                            onChange={() => {}}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                          />
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-gray-500">Creator:</span>
                            <span className="text-gray-300 ml-2">{idea.email.split('@')[0]}</span>
                          </div>
                          {idea.contributors && (
                            <div>
                              <span className="text-gray-500">Contributors:</span>
                              <span className="text-gray-300 ml-2">{idea.contributors.split(',').length}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Likes:</span>
                            <span className="text-gray-300 ml-2">{idea.likes || 0}</span>
                          </div>
                        </div>

                        {idea.description && (
                          <div className="mt-3 pt-3 border-t border-slate-600/50">
                            <p className="text-gray-400 text-xs line-clamp-2">{idea.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      💡 <strong>Tip:</strong> Select 2 or more entries to merge. The idea with the earliest event date will be kept as the primary.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDuplicates;
