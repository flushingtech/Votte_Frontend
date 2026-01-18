import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, toggleFeatured, getUserProfile } from '../api/API';
import Navbar from '../components/Navbar';

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    fetchProjects();
    fetchUserName();
  }, []);

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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (e, id, currentFeaturedStatus) => {
    e.stopPropagation();
    try {
      await toggleFeatured(id, !currentFeaturedStatus);
      setProjects(projects.map(p =>
        p.id === id ? { ...p, featured: !currentFeaturedStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      if (filter === 'featured') return project.featured;
      if (filter === 'not-featured') return !project.featured;
      return true;
    })
    .filter(project =>
      project.idea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          <p className="text-gray-400">Loading projects...</p>
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
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-amber-200">Admin Tools</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">All Projects</h1>
                <p className="text-gray-300 text-sm mt-1">Manage featured projects for the community showcase.</p>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-sm font-semibold">
                {projects.length} total
              </span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 rounded-none">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setFilter('featured')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1.5 ${
                    filter === 'featured'
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
                  }`}
                >
                  <span>⭐</span>
                  <span>Featured ({projects.filter(p => p.featured).length})</span>
                </button>
                <button
                  onClick={() => setFilter('not-featured')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    filter === 'not-featured'
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-slate-500'
                  }`}
                >
                  Not Featured ({projects.filter(p => !p.featured).length})
                </button>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full px-4 py-2 pl-10 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 rounded-none">
            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-medium">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-700/50">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/idea/${project.id}`)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-slate-800/50 ${
                      project.featured ? 'bg-yellow-900/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Project Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-700">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.idea}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                            <span className="text-2xl">🖼️</span>
                          </div>
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold truncate">{project.idea}</span>
                          {project.featured && (
                            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                              <span>⭐</span> Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className="text-gray-500 truncate">{project.event_title || 'No event'}</span>
                          {project.description && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-500 truncate line-clamp-1">{project.description}</span>
                            </>
                          )}
                        </div>
                        {/* Technologies */}
                        {project.technologies && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.split(',').slice(0, 4).map((tech, idx) => (
                              <span key={idx} className="bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                                {tech.trim()}
                              </span>
                            ))}
                            {project.technologies.split(',').length > 4 && (
                              <span className="text-gray-500 text-xs px-1.5 py-0.5">
                                +{project.technologies.split(',').length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stats and Actions */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-pink-400 flex items-center gap-1 text-sm">
                          <span>❤️</span> {project.likes || 0}
                        </span>
                        <button
                          onClick={(e) => handleToggleFeatured(e, project.id, project.featured)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-sm ${
                            project.featured
                              ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white shadow-lg'
                              : 'bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 hover:border-slate-500 text-gray-300'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={project.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="hidden sm:inline">{project.featured ? 'Featured' : 'Feature'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
