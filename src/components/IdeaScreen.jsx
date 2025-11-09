import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { getIdeaById, checkAdminStatus, getAllUsers, addContributorToIdeaEvent } from '../api/API';
import Navbar from '../components/Navbar';
import ButtonUpload from '../components/ButtonUpload';
import MarkdownWithPlugins from './MarkdownWithPluggins';
import MarkdownPreviewer from './MarkdownPreviewer';

function IdeaScreen() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpenEventId, setMenuOpenEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTechnologies, setEditTechnologies] = useState('');
  const [message, setMessage] = useState('');
  const [uploadingEventId, setUploadingEventId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contributorsEvent, setContributorsEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const editDescRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ideaData, allUsers] = await Promise.all([
          getIdeaById(ideaId),
          getAllUsers()
        ]);
        setIdea(ideaData);
        setUsers(allUsers);

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

  useEffect(() => {
    if (editingEvent) {
      setEditDescription(editingEvent.description || '');
      setEditTechnologies(editingEvent.technologies || '');
    }
  }, [editingEvent]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editDescription.trim()) {
      setMessage('Description is required');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ideas/update-event-metadata/${ideaId}/${editingEvent.event_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription,
          technologies: editTechnologies
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      // Refresh idea data
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      setEditingEvent(null);
      setMessage('Updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating event metadata:', error);
      setMessage('Failed to update');
    }
  };

  const handleUploadImage = async (eventId) => {
    setUploadingEventId(eventId);
    setMenuOpenEventId(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingEventId) return;

    const formData = new FormData();
    formData.append('uploadImages', file);

    try {
      setMessage('Uploading image...');

      console.log('Uploading file:', { ideaId, eventId: uploadingEventId, fileName: file.name, fileSize: file.size });

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/images/upload-idea-event/${ideaId}/${uploadingEventId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Refresh idea data
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      setMessage('Image uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(error.message || 'Failed to upload image');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploadingEventId(null);
      e.target.value = ''; // Reset file input
    }
  };

  const handleAddContributor = async () => {
    if (!selectedContributor || !contributorsEvent) {
      setMessage('Please select a contributor');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setMessage('Adding contributor...');

      await addContributorToIdeaEvent(ideaId, contributorsEvent.event_id, selectedContributor);

      // Refresh idea data
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      setMessage('Contributor added successfully!');
      setSelectedContributor(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding contributor:', error);
      setMessage(error.response?.data?.message || 'Failed to add contributor');
      setTimeout(() => setMessage(''), 5000);
    }
  };

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

              {/* Message Display */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.includes('success') || message.includes('successfully') ? 'bg-green-900/20 border border-green-500/30 text-green-200' : message.includes('Uploading') ? 'bg-blue-900/20 border border-blue-500/30 text-blue-200' : 'bg-red-900/20 border border-red-500/30 text-red-200'}`}>
                  {message}
                </div>
              )}

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
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 mb-6 relative"
                >
                  {/* Edit Menu Button */}
                  {(idea?.email === userEmail || isAdmin) && (
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setMenuOpenEventId(menuOpenEventId === event.event_id ? null : event.event_id)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {menuOpenEventId === event.event_id && (
                        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[150px] z-10">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setMenuOpenEventId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleUploadImage(event.event_id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            🖼️ Upload Image
                          </button>
                          <button
                            onClick={() => {
                              setContributorsEvent(event);
                              setMenuOpenEventId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            👥 Contributors
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
                        {event?.description || 'No description provided'}
                      </MarkdownWithPlugins>
                    </div>
                  </div>

                  {/* Tech Stack Section */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">⚡ Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {(event?.technologies || 'No tech stack listed')
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
                      {(event?.contributors
                        ? event.contributors.split(',').filter(c => c.trim())
                        : ['None']
                      ).map((contributor, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-600/30 text-purple-200 px-3 py-1.5 rounded-lg text-sm border border-purple-500/50"
                        >
                          {contributor.trim().split('@')[0] || 'None'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image Section */}
                  {event?.image_url && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-3">🖼️ Project Image</h3>
                      <img
                        src={event.image_url}
                        alt="Project"
                        className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg border border-slate-600/50"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Hidden file input for image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
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

      {/* Edit Event Modal */}
      {editingEvent && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: '2147483647', position: 'fixed' }} onClick={() => setEditingEvent(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: '2147483647', position: 'fixed', isolation: 'isolate' }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setEditingEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Edit Event Details
                </h2>
                <p className="text-gray-400">
                  {new Date(editingEvent.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-900/20 border border-green-500/30 text-green-200' : 'bg-red-900/20 border border-red-500/30 text-red-200'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    📝 Description for this event
                  </label>
                  <MarkdownPreviewer textRef={editDescRef}>
                    <textarea
                      ref={editDescRef}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe what was worked on for this event..."
                      rows={8}
                    />
                  </MarkdownPreviewer>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    ⚡ Technologies
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editTechnologies}
                    onChange={(e) => setEditTechnologies(e.target.value)}
                    placeholder="React, Node.js, MongoDB..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 bg-slate-700/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600/50 transition-all duration-200 border border-slate-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Contributors Modal */}
      {contributorsEvent && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: '2147483647', position: 'fixed' }} onClick={() => setContributorsEvent(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: '2147483647', position: 'fixed', isolation: 'isolate' }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setContributorsEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Manage Contributors
                </h2>
                <p className="text-gray-400">
                  {new Date(contributorsEvent.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.includes('success') || message.includes('successfully') ? 'bg-green-900/20 border border-green-500/30 text-green-200' : message.includes('Adding') ? 'bg-blue-900/20 border border-blue-500/30 text-blue-200' : 'bg-red-900/20 border border-red-500/30 text-red-200'}`}>
                  {message}
                </div>
              )}

              {/* Current Contributors */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Current Contributors</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(contributorsEvent?.contributors
                    ? contributorsEvent.contributors.split(',').filter(c => c.trim())
                    : []
                  ).length > 0 ? (
                    contributorsEvent.contributors.split(',').filter(c => c.trim()).map((contributor, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-600/30 text-purple-200 px-3 py-1.5 rounded-lg text-sm border border-purple-500/50"
                      >
                        {contributor.trim().split('@')[0]}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No contributors yet</p>
                  )}
                </div>
              </div>

              {/* Add Contributor Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Add Contributor</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    className="flex-1 text-sm"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#334155',
                        borderColor: '#475569',
                        color: 'white',
                        minHeight: '42px',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#1e293b',
                        color: 'white',
                        zIndex: 2147483650,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 2147483650,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? '#334155' : '#1e293b',
                        color: 'white',
                        cursor: 'pointer',
                      }),
                      singleValue: (base) => ({ ...base, color: 'white' }),
                      input: (base) => ({ ...base, color: 'white' }),
                      placeholder: (base) => ({ ...base, color: '#9ca3af' }),
                    }}
                    options={users.map(user => ({
                      label: `${user.name} (${user.email})`,
                      value: user.email
                    }))}
                    placeholder="Select contributor..."
                    value={users
                      .map(user => ({
                        label: `${user.name} (${user.email})`,
                        value: user.email
                      }))
                      .find(opt => opt.value === selectedContributor) || null}
                    onChange={(selectedOption) =>
                      setSelectedContributor(selectedOption?.value || null)
                    }
                  />
                  <button
                    onClick={handleAddContributor}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg whitespace-nowrap"
                  >
                    👥 Add Contributor
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setContributorsEvent(null)}
                  className="w-full bg-slate-700/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600/50 transition-all duration-200 border border-slate-600/50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default IdeaScreen;
