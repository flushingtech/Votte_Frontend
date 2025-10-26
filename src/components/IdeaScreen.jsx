import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdeaById, checkAdminStatus } from '../api/API';
import Navbar from '../components/Navbar';
import ButtonUpload from '../components/ButtonUpload';
import MarkdownWithPlugins from './MarkdownWithPluggins';

function IdeaScreen() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ideaData = await getIdeaById(ideaId);
        setIdea(ideaData);

        if (userEmail) {
          const status = await checkAdminStatus(userEmail);
          setIsAdmin(status);
        }
      } catch (err) {
        console.error('Error fetching idea details:', err);
        setError('Failed to load idea');
      } finally {
        setLoading(false);
      }
    };

    if (ideaId) fetchData();
  }, [ideaId, userEmail]);

  if (loading)
    return (
      <div
        className="min-h-screen text-white"
        style={{
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
          minHeight: '100vh'
        }}
      >
        <Navbar userName={userEmail} backToHome={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading idea details...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen text-white"
        style={{
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
          minHeight: '100vh'
        }}
      >
        <Navbar userName={userEmail} backToHome={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
        minHeight: '100vh'
      }}
    >
      <div className="sticky top-0 z-50">
        <Navbar userName={userEmail} backToHome={true} />
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* MAIN CONTENT (cols 1-4) */}
            <div className="lg:col-span-4 relative">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute -left-12 top-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                title="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              {/* Title Header */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {idea?.idea}
                </h1>
                <p className="text-sm text-gray-400">
                  Submitted by: {idea?.email?.split('@')[0] || 'Unknown'}
                </p>
              </div>

              {/* Event Details Cards */}
              {idea?.events?.map((event) => (
                <div
                  key={event.event_id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 mb-6"
                >
                  {/* Event Date Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-blue-600/50 text-blue-200 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-500/50">
                      📅 {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Description Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">📝 Description</h3>
                    <div className="text-gray-200 leading-relaxed">
                      <MarkdownWithPlugins className="prose prose-invert max-w-none">
                        {idea?.description || 'No description provided'}
                      </MarkdownWithPlugins>
                    </div>
                  </div>

                  {/* Tech Stack Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">⚡ Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {(idea?.technologies || 'No tech stack listed')
                        .split(',')
                        .map((tech, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-700/50 text-gray-200 px-3 py-1.5 rounded-lg text-sm border border-slate-600/50"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Contributors Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">👥 Contributors</h3>
                    <div className="flex flex-wrap gap-2">
                      {(idea?.contributors
                        ? idea.contributors.split(',')
                        : ['None']
                      ).map((contributor, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-600/30 text-purple-200 px-3 py-1.5 rounded-lg text-sm border border-purple-500/50"
                        >
                          {contributor.trim().split('@')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image Section */}
                  {idea?.image_url && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-3">🖼️ Project Image</h3>
                      <img
                        src={idea.image_url}
                        alt="Project"
                        className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg border border-slate-600/50"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ADMIN PANEL (col 5) */}
            {isAdmin && (
              <div className="lg:col-span-1">
                <div className="sticky top-6 self-start" style={{ zIndex: 20 }}>
                  <aside className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-xl border border-orange-700/50 shadow-2xl p-4">
                    <div className="flex flex-col items-start mb-4">
                      <h2 className="text-white text-base font-bold whitespace-nowrap mb-1">
                        ⚙️ Admin Controls
                      </h2>
                    </div>
                    <ButtonUpload ideaId={idea?.id} />
                  </aside>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeaScreen;
