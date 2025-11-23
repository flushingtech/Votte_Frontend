import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, toggleFeatured, getUserProfile } from '../api/API';
import Navbar from '../components/Navbar';

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, featured, not-featured
  const [userName, setUserName] = useState('');
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

  const handleToggleFeatured = async (id, currentFeaturedStatus) => {
    try {
      await toggleFeatured(id, !currentFeaturedStatus);
      setProjects(projects.map(p =>
        p.id === id ? { ...p, featured: !currentFeaturedStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'featured') return project.featured;
    if (filter === 'not-featured') return !project.featured;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}>
        <Navbar userName={userName || userEmail} backToHome={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
    }}>
      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} backToHome={true} />
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                All Projects
              </h1>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                Manage featured projects for the community showcase
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Admin
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-700/50 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                filter === 'all'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
              } rounded-t-lg`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                filter === 'featured'
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
              } rounded-t-lg`}
            >
              Featured ({projects.filter(p => p.featured).length})
            </button>
            <button
              onClick={() => setFilter('not-featured')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                filter === 'not-featured'
                  ? 'border-gray-500 text-gray-400 bg-gray-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
              } rounded-t-lg`}
            >
              Not Featured ({projects.filter(p => !p.featured).length})
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
              <p className="text-gray-400 text-lg">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border ${
                    project.featured ? 'border-yellow-500/50' : 'border-slate-700/50'
                  } shadow-2xl overflow-hidden hover:scale-105 transition-transform`}
                >
                  {/* Project Image */}
                  {project.image_url ? (
                    <div className="h-48 overflow-hidden bg-slate-900">
                      <img
                        src={project.image_url}
                        alt={project.idea}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {project.idea}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Event and Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{project.event_title}</span>
                      <span>{project.likes || 0} likes</span>
                    </div>

                    {/* Technologies */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.split(',').slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {tech.trim()}
                          </span>
                        ))}
                        {project.technologies.split(',').length > 3 && (
                          <span className="text-gray-500 text-xs px-2 py-1">
                            +{project.technologies.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feature Button */}
                    <button
                      onClick={() => handleToggleFeatured(project.id, project.featured)}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        project.featured
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={project.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {project.featured ? 'Featured' : 'Feature Project'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
