import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDuplicateIdeas, mergeIdeas, checkAdminStatus, getIdeas, getUserProfile, getDisplayNames } from '../api/API';
import Navbar from './Navbar';

function AdminDuplicates() {
  const navigate = useNavigate();
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState('auto');
  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [displayNames, setDisplayNames] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  const getDisplayName = (email) => {
    return displayNames[email] || email?.split('@')[0] || '';
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);

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

      const allEmails = groups.flatMap(group => group.ideas.map(idea => idea.email)).filter(Boolean);
      const uniqueEmails = [...new Set(allEmails)];
      if (uniqueEmails.length > 0) {
        const names = await getDisplayNames(uniqueEmails);
        setDisplayNames(prevNames => ({ ...prevNames, ...names }));
      }
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      setMessage('Failed to load duplicates');
    }
  };

  const fetchAllProjects = async () => {
    try {
      const projects = await getIdeas();
      setAllProjects(projects);

      const allEmails = projects.map(idea => idea.email).filter(Boolean);
      const uniqueEmails = [...new Set(allEmails)];
      if (uniqueEmails.length > 0) {
        const names = await getDisplayNames(uniqueEmails);
        setDisplayNames(prevNames => ({ ...prevNames, ...names }));
      }
    } catch (error) {
      console.error('Error fetching all projects:', error);
      setMessage('Failed to load projects');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (mode === 'manual') {
        fetchAllProjects();
      } else {
        fetchDuplicates();
      }
    }
  }, [mode, isAdmin]);

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

      if (mode === 'manual') {
        await fetchAllProjects();
      } else {
        await fetchDuplicates();
      }
    } catch (error) {
      console.error('Error merging ideas:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage(`❌ Failed to merge ideas: ${errorMsg}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#000000' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="sticky top-0 z-50">
          <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#000000' }}>
        <div className="sticky top-0 z-50">
          <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <p className="text-red-400 font-medium text-xl">Access Denied: Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex-1 px-4 sm:px-6 py-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800/60 to-orange-800/60 border border-amber-700/50 p-6 shadow-2xl rounded-none">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white p-3 rounded-xl font-semibold transition-all flex items-center justify-center"
                title="Back to Admin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-200">Admin Tools</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Merge Duplicate Ideas</h1>
                <p className="text-gray-300 text-sm mt-1">Find and merge duplicate project submissions across events.</p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('Success') || message.includes('merged')
                ? 'bg-green-900/20 border-green-500/50 text-green-300'
                : 'bg-red-900/20 border-red-500/50 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 rounded-none">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('auto');
                  setSelectedIdeas([]);
                  setSelectedGroup(null);
                  setSearchQuery('');
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === 'auto'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <span>🔍</span>
                <span>Auto-Detected</span>
              </button>
              <button
                onClick={() => {
                  setMode('manual');
                  setSelectedIdeas([]);
                  setSelectedGroup(null);
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === 'manual'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <span>✏️</span>
                <span>Manual Search</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 rounded-none">
            {mode === 'auto' ? (
              duplicateGroups.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No duplicates found!</h3>
                  <p className="text-gray-400">All ideas are unique or already merged.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      Found <span className="text-white font-medium">{duplicateGroups.length}</span> duplicate group{duplicateGroups.length !== 1 ? 's' : ''}
                    </p>
                    {selectedIdeas.length >= 2 && (
                      <button
                        onClick={handleMerge}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                      >
                        <span>🔗</span>
                        <span>Merge Selected ({selectedIdeas.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Duplicate Groups */}
                  {duplicateGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="border border-slate-700/60 rounded-xl overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-slate-700/50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-white">{group.title}</h2>
                            <p className="text-amber-300/80 text-xs">{group.count} duplicate entries</p>
                          </div>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold">
                            {group.count} found
                          </span>
                        </div>
                      </div>

                      {/* Ideas List */}
                      <div className="divide-y divide-slate-700/50">
                        {group.ideas.map((idea) => (
                          <div
                            key={idea.id}
                            onClick={() => {
                              setSelectedGroup(groupIdx);
                              handleSelectIdea(idea.id);
                            }}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                              selectedIdeas.includes(idea.id)
                                ? 'bg-amber-900/20'
                                : 'hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Checkbox */}
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedIdeas.includes(idea.id)
                                  ? 'bg-amber-500 border-amber-500'
                                  : 'border-slate-600 hover:border-slate-500'
                              }`}>
                                {selectedIdeas.includes(idea.id) && (
                                  <span className="text-white text-sm">✓</span>
                                )}
                              </div>

                              {/* Main content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-white font-semibold truncate">{idea.idea}</span>
                                  <span className="text-gray-600 text-xs">ID: {idea.id}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm">
                                  <span className="text-gray-400 flex items-center gap-1">
                                    <span>👤</span> {getDisplayName(idea.email)}
                                  </span>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-gray-500">{formatDate(idea.event_date)}</span>
                                  {idea.event_title && (
                                    <>
                                      <span className="text-gray-600">•</span>
                                      <span className="text-gray-500 truncate">{idea.event_title}</span>
                                    </>
                                  )}
                                </div>
                                {idea.description && (
                                  <p className="text-gray-500 text-sm mt-1 line-clamp-1 italic">"{idea.description}"</p>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-3 flex-shrink-0 text-sm">
                                {idea.contributors && (
                                  <span className="text-purple-400 flex items-center gap-1">
                                    <span>👥</span> {idea.contributors.split(',').length}
                                  </span>
                                )}
                                <span className="text-pink-400 flex items-center gap-1">
                                  <span>❤️</span> {idea.likes || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Tip */}
                  <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm">
                      💡 <strong>Tip:</strong> Select 2 or more entries to merge. The idea with the earliest event date will be kept as the primary.
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* Manual Search Mode */
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search all projects by title..."
                    className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Selection banner */}
                {selectedIdeas.length >= 2 && (
                  <div className="flex items-center justify-between bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm">
                      <strong>{selectedIdeas.length} projects selected</strong> - Ready to merge
                    </p>
                    <button
                      onClick={handleMerge}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                    >
                      <span>🔗</span>
                      <span>Merge Selected</span>
                    </button>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    Showing <span className="text-white font-medium">
                      {allProjects.filter(p => p.idea.toLowerCase().includes(searchQuery.toLowerCase())).length}
                    </span> project{allProjects.filter(p => p.idea.toLowerCase().includes(searchQuery.toLowerCase())).length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Projects List */}
                {allProjects.filter(p => p.idea.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                    <p className="text-gray-400">Try a different search term.</p>
                  </div>
                ) : (
                  <div className="border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-700/50">
                    {allProjects
                      .filter(project => project.idea.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleSelectIdea(project.id)}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            selectedIdeas.includes(project.id)
                              ? 'bg-amber-900/20'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedIdeas.includes(project.id)
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}>
                              {selectedIdeas.includes(project.id) && (
                                <span className="text-white text-sm">✓</span>
                              )}
                            </div>

                            {/* Main content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-semibold truncate">{project.idea}</span>
                                <span className="text-gray-600 text-xs">ID: {project.id}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <span>👤</span> {getDisplayName(project.email)}
                                </span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500">{formatDate(project.event_date)}</span>
                                {project.event_title && (
                                  <>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-500 truncate">{project.event_title}</span>
                                  </>
                                )}
                              </div>
                              {project.description && (
                                <p className="text-gray-500 text-sm mt-1 line-clamp-1 italic">"{project.description}"</p>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 flex-shrink-0 text-sm">
                              {project.contributors && (
                                <span className="text-purple-400 flex items-center gap-1">
                                  <span>👥</span> {project.contributors.split(',').length}
                                </span>
                              )}
                              <span className="text-pink-400 flex items-center gap-1">
                                <span>❤️</span> {project.likes || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Tip */}
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-200 text-sm">
                    💡 <strong>Tip:</strong> Search for projects and select 2 or more to merge. The idea with the earliest event date will be kept as the primary.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDuplicates;
