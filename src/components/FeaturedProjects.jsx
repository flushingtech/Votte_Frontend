import { useEffect, useState } from 'react';
import { getFeaturedProjects } from '../api/API';
import { useNavigate } from 'react-router-dom';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (ideaId, eventId) => {
    navigate(`/idea/${ideaId}`, { state: { eventId } });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⭐</span>
          <h2 className="text-xl font-bold text-white">Featured Projects</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading featured projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⭐</span>
          <h2 className="text-xl font-bold text-white">Featured Projects</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p>No featured projects yet</p>
          <p className="text-sm mt-2">Check back soon for highlighted projects!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⭐</span>
        <h2 className="text-xl font-bold text-white">Featured Projects</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id, project.event_id)}
            className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg overflow-hidden hover:border-yellow-500/60 transition-all cursor-pointer group"
          >
            {/* Project Image */}
            {project.image_url ? (
              <div className="h-32 overflow-hidden bg-slate-900">
                <img
                  src={project.image_url}
                  alt={project.idea}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}

            {/* Project Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1">
                  {project.idea}
                </h3>
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>

              <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologies && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.split(',').slice(0, 2).map((tech, idx) => (
                    <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded text-xs">
                      {tech.trim()}
                    </span>
                  ))}
                  {project.technologies.split(',').length > 2 && (
                    <span className="text-gray-500 text-xs px-1">
                      +{project.technologies.split(',').length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="truncate">{project.event_title}</span>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <span>❤️</span>
                  <span>{project.likes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProjects;
