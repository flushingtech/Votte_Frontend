import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { getIdeaById, checkAdminStatus, getAllUsers, addContributorToIdeaEvent, removeContributorFromIdeaEvent, getDisplayNames, getUserProfile, createContributorRequest, getPendingRequestsForIdea, acceptContributorRequest, declineContributorRequest } from '../api/API';
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingGithubRepos, setEditingGithubRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [displayNames, setDisplayNames] = useState({});
  const [contributorProfiles, setContributorProfiles] = useState({});
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [hasRequestedToContribute, setHasRequestedToContribute] = useState(false);
  const editDescRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  // Helper function to get display name (always exclude @ and domain)
  const getDisplayName = (email) => {
    const name = displayNames[email] || email?.split('@')[0] || '';
    // Extra safeguard: if name somehow contains @, split it
    return name.includes('@') ? name.split('@')[0] : name;
  };

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

          // Fetch user's display name
          try {
            const profile = await getUserProfile(userEmail);
            setUserName(profile.name || userEmail.split('@')[0]);
            setProfilePicture(profile.profile_picture || '');
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserName(userEmail.split('@')[0]);
          }
        }

        // Fetch display names and profile pictures for all contributors
        const allContributorEmails = ideaData?.events
          ?.flatMap(event =>
            event.contributors
              ? event.contributors.split(',').map(c => c.trim()).filter(Boolean)
              : []
          ) || [];
        const uniqueEmails = [...new Set(allContributorEmails)];

        if (uniqueEmails.length > 0) {
          const names = await getDisplayNames(uniqueEmails);
          setDisplayNames(names);

          // Fetch profile pictures for all contributors
          const profiles = {};
          await Promise.all(
            uniqueEmails.map(async (email) => {
              try {
                const profile = await getUserProfile(email);
                profiles[email] = {
                  name: profile.name || email.split('@')[0],
                  profile_picture: profile.profile_picture || ''
                };
              } catch (error) {
                console.error(`Error fetching profile for ${email}:`, error);
                profiles[email] = {
                  name: email.split('@')[0],
                  profile_picture: ''
                };
              }
            })
          );
          setContributorProfiles(profiles);
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

  useEffect(() => {
    if (contributorsEvent) {
      loadPendingRequests(contributorsEvent.event_id);
    }
  }, [contributorsEvent]);

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

  const handleSaveGithubRepos = async () => {
    if (!idea) {
      setMessage('Idea data not loaded');
      return;
    }

    // Filter out empty repos
    const validRepos = githubRepos.filter(repo => repo.title.trim() && repo.url.trim());

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ideas/editIdea/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_repos: validRepos
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error details:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to update');
      }

      // Refresh idea data
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      setEditingGithubRepos(false);
      setMessage('Repositories updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating GitHub repos:', error);
      console.error('Full error:', error.message);
      setMessage(`Failed: ${error.message}`);
      setTimeout(() => setMessage(''), 8000);
    }
  };

  const handleEditGithubRepos = () => {
    // Parse existing repos or start with empty array
    try {
      const existing = idea?.github_repo ? JSON.parse(idea.github_repo) : [];
      setGithubRepos(Array.isArray(existing) ? existing : []);
    } catch {
      setGithubRepos([]);
    }
    setEditingGithubRepos(true);
  };

  const handleAddRepo = () => {
    setGithubRepos([...githubRepos, { title: '', url: '' }]);
  };

  const handleRemoveRepo = (index) => {
    setGithubRepos(githubRepos.filter((_, i) => i !== index));
  };

  const handleRepoChange = (index, field, value) => {
    const updated = [...githubRepos];
    updated[index][field] = value;
    setGithubRepos(updated);
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

  const handleRemoveContributor = async (eventId, contributorEmail) => {
    if (!confirm(`Remove ${contributorEmail.split('@')[0]} as a contributor?`)) {
      return;
    }

    try {
      setMessage('Removing contributor...');

      await removeContributorFromIdeaEvent(ideaId, eventId, contributorEmail);

      // Refresh idea data
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      setMessage('Contributor removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing contributor:', error);
      setMessage(error.response?.data?.message || 'Failed to remove contributor');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleRequestToContribute = async () => {
    if (!contributorsEvent || !userEmail) {
      setMessage('Unable to send request');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setMessage('Sending request...');
      await createContributorRequest(ideaId, contributorsEvent.event_id, userEmail, requestMessage);

      setMessage('Request sent successfully!');
      setHasRequestedToContribute(true);
      setRequestMessage('');
      setTimeout(() => setMessage(''), 3000);

      // Reload pending requests
      await loadPendingRequests(contributorsEvent.event_id);
    } catch (error) {
      console.error('Error sending contributor request:', error);
      setMessage(error.response?.data?.message || 'Failed to send request');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setMessage('Accepting request...');
      await acceptContributorRequest(requestId, userEmail);

      // Refresh idea data and pending requests
      const ideaData = await getIdeaById(ideaId);
      setIdea(ideaData);

      if (contributorsEvent) {
        await loadPendingRequests(contributorsEvent.event_id);
      }

      setMessage('Request accepted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error accepting request:', error);
      setMessage(error.response?.data?.message || 'Failed to accept request');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (!confirm('Decline this contributor request?')) {
      return;
    }

    try {
      setMessage('Declining request...');
      await declineContributorRequest(requestId, userEmail);

      // Reload pending requests
      if (contributorsEvent) {
        await loadPendingRequests(contributorsEvent.event_id);
      }

      setMessage('Request declined');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error declining request:', error);
      setMessage(error.response?.data?.message || 'Failed to decline request');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const loadPendingRequests = async (eventId) => {
    try {
      const requests = await getPendingRequestsForIdea(ideaId, eventId);
      setPendingRequests(requests);

      // Check if current user has a pending request
      const userHasRequest = requests.some(req => req.requester_email === userEmail);
      setHasRequestedToContribute(userHasRequest);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen text-white relative overflow-hidden"
        style={{
          background: '#000000',
          minHeight: '100vh'
        }}
      >
        {/* Light blue flashes/glowing effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-[10%] right-[25%] w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
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
        className="min-h-screen text-white relative overflow-hidden"
        style={{
          background: '#000000',
          minHeight: '100vh'
        }}
      >
        {/* Light blue flashes/glowing effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-[10%] right-[25%] w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
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
      className="min-h-screen relative overflow-hidden"
      style={{
        background: '#000000',
        minHeight: '100vh'
      }}
    >
      {/* Light blue flashes/glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[10%] right-[25%] w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
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
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-xl p-4 mb-4">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {idea?.idea}
                </h1>
                <p className="text-xs text-gray-400">
                  Submitted by: {idea?.email?.split('@')[0] || 'Unknown'}
                </p>
              </div>

              {/* Project Timeline */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    Project Timeline
                    <span className="text-xs font-normal text-gray-400">({idea?.events?.length || 0} {idea?.events?.length === 1 ? 'Event' : 'Events'})</span>
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                </div>

                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-blue-500/50"></div>

                  {/* Event cards with timeline nodes */}
                  {idea?.events?.map((event, index) => {
                    const hasAwards = event?.awards && Array.isArray(event.awards) && event.awards.length > 0;
                    const hasVotes = event?.votes > 0 || event?.most_creative_votes > 0 || event?.most_technical_votes > 0 || event?.most_impactful_votes > 0;
                    const isFirst = index === 0;
                    const isLast = index === idea.events.length - 1;

                    return (
                      <div key={event.event_id} className="relative pl-14 pb-5 last:pb-0">
                        {/* Timeline node */}
                        <div className="absolute left-0 top-0 flex flex-col items-center">
                          {/* Node circle */}
                          <div className={`w-10 h-10 rounded-full border-3 ${
                            isFirst ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400/50 shadow-lg shadow-green-500/50' :
                            isLast ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400/50 shadow-lg shadow-blue-500/50' :
                            'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500/50'
                          } flex items-center justify-center text-white font-bold text-xs z-10`}>
                            {isFirst ? '🎯' : isLast ? '🏁' : index + 1}
                          </div>
                          {/* Event order label */}
                          <div className="mt-0.5 text-[10px] text-gray-400 font-semibold">
                            {isFirst ? 'START' : isLast ? 'LATEST' : `#${index + 1}`}
                          </div>
                        </div>

                        {/* Event card */}
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-xl overflow-hidden hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300"
                        >
                    {/* Event Header */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-slate-700/50 px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                              <span className="text-blue-400 text-sm">📅</span>
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </h2>
                          </div>
                          {event.title && (
                            <p className="text-gray-300 text-xs font-medium">{event.title}</p>
                          )}
                        </div>

                        {/* Admin/Owner Menu - Three Dots */}
                        {(idea?.email === userEmail || isAdmin) && (
                          <div className="relative">
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
                      </div>

                    </div>

                    {/* Trophy Showcase - Minimal */}
                    {hasAwards && (
                      <div className="bg-gradient-to-r from-yellow-900/20 via-yellow-800/20 to-yellow-900/20 border-y border-yellow-500/30 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {event.awards.map((award, idx) => {
                            const awardStyles = {
                              'Hackathon Winner': {
                                bg: 'from-yellow-500 to-yellow-700',
                                text: 'text-yellow-100',
                                icon: '🏆',
                                glow: 'shadow-yellow-500/50'
                              },
                              'Most Creative': {
                                bg: 'from-green-500 to-emerald-700',
                                text: 'text-green-100',
                                icon: '🎨',
                                glow: 'shadow-green-500/50'
                              },
                              'Most Technical': {
                                bg: 'from-purple-500 to-purple-700',
                                text: 'text-purple-100',
                                icon: '⚡',
                                glow: 'shadow-purple-500/50'
                              },
                              'Most Impactful': {
                                bg: 'from-red-500 to-rose-700',
                                text: 'text-red-100',
                                icon: '🚀',
                                glow: 'shadow-red-500/50'
                              }
                            };
                            const style = awardStyles[award] || awardStyles['Most Creative'];
                            return (
                              <div
                                key={idx}
                                className={`bg-gradient-to-br ${style.bg} ${style.text} px-2 py-1 rounded-md flex items-center gap-1 shadow-lg ${style.glow} hover:scale-105 transition-transform flex-shrink-0`}
                              >
                                <span className="text-sm">{style.icon}</span>
                                <span className="text-[10px] font-bold whitespace-nowrap">{award}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Content Grid - Compact */}
                    <div className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Image Card */}
                        {event?.image_url && (
                          <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-2.5 hover:border-slate-600/50 transition-all">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-lg">🖼️</span>
                              <h3 className="text-xs font-bold text-white">Showcase</h3>
                            </div>
                            <img
                              src={event.image_url}
                              alt="Project"
                              className="w-full h-36 object-cover rounded-lg shadow-lg"
                            />
                          </div>
                        )}

                        {/* Stats Card */}
                        {hasVotes && (
                          <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-2.5 hover:border-slate-600/50 transition-all">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-lg">📊</span>
                              <h3 className="text-xs font-bold text-white">Votes</h3>
                            </div>
                            <div className="space-y-1.5">
                              {event?.votes > 0 && (
                                <div className="flex items-center justify-between p-1.5 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                  <span className="text-gray-300 text-[10px] font-medium">Total</span>
                                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold text-xs">
                                    {event.votes}
                                  </span>
                                </div>
                              )}
                              {event?.most_creative_votes > 0 && (
                                <div className="flex items-center justify-between p-1.5 bg-green-900/20 rounded-lg border border-green-500/30">
                                  <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                                    <span>🎨</span> Creative
                                  </span>
                                  <span className="bg-green-600 text-white px-2 py-0.5 rounded-full font-bold text-xs">
                                    {event.most_creative_votes}
                                  </span>
                                </div>
                              )}
                              {event?.most_technical_votes > 0 && (
                                <div className="flex items-center justify-between p-1.5 bg-purple-900/20 rounded-lg border border-purple-500/30">
                                  <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                                    <span>⚡</span> Technical
                                  </span>
                                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold text-xs">
                                    {event.most_technical_votes}
                                  </span>
                                </div>
                              )}
                              {event?.most_impactful_votes > 0 && (
                                <div className="flex items-center justify-between p-1.5 bg-red-900/20 rounded-lg border border-red-500/30">
                                  <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                                    <span>🚀</span> Impactful
                                  </span>
                                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-bold text-xs">
                                    {event.most_impactful_votes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contributors Card - Compact */}
                        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-2.5 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">👥</span>
                              <h3 className="text-xs font-bold text-white">Contributors</h3>
                            </div>
                            {(() => {
                              const contributorsList = event?.contributors
                                ? event.contributors.split(',').filter(c => c.trim())
                                : [];
                              return contributorsList.length > 0 && (
                                <span className="bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-500/50">
                                  {contributorsList.length}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="space-y-2">
                              {/* Contributor Avatars */}
                              <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                  const contributorsList = event?.contributors
                                    ? event.contributors.split(',').filter(c => c.trim())
                                    : [];

                                  if (contributorsList.length === 0) {
                                    return <p className="text-gray-400 text-[10px]">No contributors yet</p>;
                                  }

                                  return contributorsList.map((contributor, idx) => {
                                    const contributorEmail = contributor.trim();
                                    const displayName = getDisplayName(contributorEmail);
                                    const initial = displayName.charAt(0).toUpperCase();
                                    const profilePic = contributorProfiles[contributorEmail]?.profile_picture;

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => navigate(`/profile/${contributorEmail.split('@')[0]}`)}
                                        className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 hover:border-purple-400/60 rounded-lg px-1.5 py-0.5 transition-all duration-200 cursor-pointer"
                                        title={`View ${displayName}'s profile`}
                                      >
                                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                          {profilePic ? (
                                            <img
                                              src={profilePic}
                                              alt={displayName}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                                              {initial}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-purple-200 text-[10px] font-medium">{displayName}</span>
                                        {contributorEmail === userEmail && (
                                          <span className="text-green-400 text-[10px]">✓</span>
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>

                              {/* User Status & Actions */}
                              {(() => {
                                const contributorsList = event?.contributors
                                  ? event.contributors.split(',').map(c => c.trim())
                                  : [];
                                const isContributor = contributorsList.includes(userEmail);
                                const isOwner = idea?.email === userEmail;

                                // Check if user has pending request for this event
                                const hasPendingRequest = pendingRequests.some(
                                  req => req.event_id === event.event_id && req.requester_email === userEmail
                                );

                                // Admins and owners see nothing - they use the three-dots menu
                                if (isOwner || isAdmin) {
                                  return null;
                                } else if (isContributor) {
                                  // Contributors see success badge
                                  return (
                                    <div className="mt-1.5 bg-green-900/20 border border-green-500/30 text-green-200 px-2 py-1 rounded-lg text-[10px] flex items-center gap-1">
                                      <span className="text-green-400">✓</span>
                                      <span className="font-semibold">You're a contributor</span>
                                    </div>
                                  );
                                } else if (hasPendingRequest) {
                                  // User has a pending request
                                  return (
                                    <div className="mt-1.5 bg-blue-900/20 border border-blue-500/30 text-blue-200 px-2 py-1 rounded-lg text-[10px] flex items-center gap-1">
                                      <span className="animate-pulse">⏳</span>
                                      <span className="font-semibold">Request Pending</span>
                                    </div>
                                  );
                                } else {
                                  // User can request to join
                                  return (
                                    <button
                                      onClick={() => setContributorsEvent(event)}
                                      className="w-full mt-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-1"
                                    >
                                      <span>🙋</span>
                                      <span>Request to Join</span>
                                    </button>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Description Card - Full Width */}
                        <div className="md:col-span-2 lg:col-span-3 bg-slate-900/40 border border-slate-700/50 rounded-xl p-2.5 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg">📝</span>
                            <h3 className="text-xs font-bold text-white">Description</h3>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <MarkdownWithPlugins className="text-gray-300 text-xs leading-relaxed">
                              {event?.description || 'No description provided'}
                            </MarkdownWithPlugins>
                          </div>
                        </div>

                        {/* Tech Stack Card - Full Width */}
                        <div className="md:col-span-2 lg:col-span-3 bg-slate-900/40 border border-slate-700/50 rounded-xl p-2.5 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg">⚡</span>
                            <h3 className="text-xs font-bold text-white">Tech Stack</h3>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(event?.technologies || 'None listed')
                              .split(',')
                              .map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-500/40"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              </div>

              {/* Hidden file input for image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* SIDEBAR (col 5) - Summary + Admin */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 self-start space-y-4" style={{ zIndex: 20 }}>
                {/* SUMMARY PANEL */}
                <aside className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-700/50 shadow-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                      <span className="text-blue-400">📊</span>
                      Summary
                    </h2>
                    {isAdmin && (
                      <button
                        onClick={() => setShowAdminPanel(!showAdminPanel)}
                        className="text-orange-400 hover:text-orange-300 transition-colors p-1 hover:bg-slate-700/50 rounded"
                        title={showAdminPanel ? 'Hide admin controls' : 'Show admin controls'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Total Votes */}
                  {(() => {
                    const totalVotes = idea?.events?.reduce((sum, event) => sum + Number(event.votes || 0), 0) || 0;
                    const totalCreative = idea?.events?.reduce((sum, event) => sum + Number(event.most_creative_votes || 0), 0) || 0;
                    const totalTechnical = idea?.events?.reduce((sum, event) => sum + Number(event.most_technical_votes || 0), 0) || 0;
                    const totalImpactful = idea?.events?.reduce((sum, event) => sum + Number(event.most_impactful_votes || 0), 0) || 0;

                    return totalVotes > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                          <span className="text-blue-400 text-xs">🗳️</span>
                          Total Votes
                        </h3>
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-xs">📊 All Events</span>
                            <span className="bg-blue-600/40 text-blue-200 px-2 py-1 rounded font-bold text-sm border border-blue-500/60">
                              {totalVotes}
                            </span>
                          </div>
                          {totalCreative > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-xs">🎨 Creative</span>
                              <span className="text-green-200 text-xs font-semibold">{totalCreative}</span>
                            </div>
                          )}
                          {totalTechnical > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-xs">⚡ Technical</span>
                              <span className="text-purple-200 text-xs font-semibold">{totalTechnical}</span>
                            </div>
                          )}
                          {totalImpactful > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-xs">🚀 Impactful</span>
                              <span className="text-red-200 text-xs font-semibold">{totalImpactful}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Total Awards */}
                  {(() => {
                    const allAwards = idea?.events?.flatMap(event => event.awards || []) || [];
                    const uniqueAwards = [...new Set(allAwards)];
                    const awardCounts = {};
                    allAwards.forEach(award => {
                      awardCounts[award] = (awardCounts[award] || 0) + 1;
                    });

                    return uniqueAwards.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                          <span className="text-yellow-400 text-xs">🏆</span>
                          Awards ({allAwards.length})
                        </h3>
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 space-y-2">
                          {uniqueAwards.map((award, idx) => {
                            const awardStyles = {
                              'Hackathon Winner': { icon: '🏆', color: 'text-yellow-200' },
                              'Most Creative': { icon: '🎨', color: 'text-green-200' },
                              'Most Technical': { icon: '⚡', color: 'text-purple-200' },
                              'Most Impactful': { icon: '🚀', color: 'text-red-200' }
                            };
                            const style = awardStyles[award] || { icon: '🏆', color: 'text-yellow-200' };
                            return (
                              <div key={idx} className="flex items-center justify-between">
                                <span className={`text-xs ${style.color} flex items-center gap-1`}>
                                  <span>{style.icon}</span>
                                  {award}
                                </span>
                                {awardCounts[award] > 1 && (
                                  <span className="bg-slate-700/50 text-gray-300 px-1.5 py-0.5 rounded text-xs font-semibold">
                                    ×{awardCounts[award]}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* All Contributors */}
                  {(() => {
                    const allContributors = idea?.events
                      ?.flatMap(event =>
                        event.contributors
                          ? event.contributors.split(',').map(c => c.trim()).filter(Boolean)
                          : []
                      ) || [];
                    const uniqueContributors = [...new Set(allContributors)];

                    return uniqueContributors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                          <span className="text-purple-400 text-xs">👥</span>
                          Contributors ({uniqueContributors.length})
                        </h3>
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex flex-wrap gap-1">
                            {uniqueContributors.map((contributor, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded text-xs border border-purple-500/50"
                              >
                                {getDisplayName(contributor)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Empty state */}
                  {!idea?.events?.some(e => e.votes > 0) &&
                   !idea?.events?.some(e => e.awards?.length > 0) &&
                   !idea?.events?.some(e => e.contributors) && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-xs">No data yet</p>
                    </div>
                  )}
                </aside>

                {/* GITHUB REPOSITORY PANEL */}
                <aside className="bg-gradient-to-br from-slate-900/30 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 shadow-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                      <span className="text-gray-400">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </span>
                      Repositories
                    </h2>
                    {!editingGithubRepos && (
                      <button
                        onClick={handleEditGithubRepos}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-slate-700/50 rounded"
                        title="Edit repositories"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {editingGithubRepos ? (
                    <div className="space-y-3">
                      {githubRepos.map((repo, index) => (
                        <div key={index} className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-medium">Repository {index + 1}</span>
                            <button
                              onClick={() => handleRemoveRepo(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove repository"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={repo.title}
                            onChange={(e) => handleRepoChange(index, 'title', e.target.value)}
                            placeholder="Title (e.g., Frontend, Backend, Mobile App)"
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={repo.url}
                            onChange={(e) => handleRepoChange(index, 'url', e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}

                      <button
                        onClick={handleAddRepo}
                        className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-gray-300 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Repository
                      </button>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveGithubRepos}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Save All
                        </button>
                        <button
                          onClick={() => setEditingGithubRepos(false)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    try {
                      const repos = idea?.github_repo ? JSON.parse(idea.github_repo) : [];
                      return Array.isArray(repos) && repos.length > 0 ? (
                        <div className="space-y-2">
                          {repos.map((repo, index) => (
                            <div key={index} className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
                              <div className="text-gray-400 text-xs font-medium mb-1">{repo.title}</div>
                              <a
                                href={repo.url.startsWith('http') ? repo.url : `https://${repo.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm break-all transition-colors flex items-center gap-2"
                              >
                                <span>🔗</span>
                                <span className="underline">{repo.url}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
                          <p className="text-gray-500 text-sm italic">No repositories linked</p>
                        </div>
                      );
                    } catch {
                      return (
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
                          <p className="text-gray-500 text-sm italic">No repositories linked</p>
                        </div>
                      );
                    }
                  })()}
                </aside>

                {/* ADMIN PANEL */}
                {isAdmin && showAdminPanel && (
                  <aside className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm border border-orange-700/50 shadow-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white text-base font-bold whitespace-nowrap">
                        ⚙️ Admin Controls
                      </h2>
                      <button
                        onClick={() => setShowAdminPanel(false)}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
                        title="Hide admin controls"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <ButtonUpload ideaId={idea?.id} />
                  </aside>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: '2147483647', position: 'fixed' }} onClick={() => setEditingEvent(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: '2147483647', position: 'fixed', isolation: 'isolate' }}>
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
                      <div
                        key={idx}
                        className="bg-purple-600/30 text-purple-200 px-3 py-1.5 rounded-lg text-sm border border-purple-500/50 flex items-center gap-2"
                      >
                        <span>{getDisplayName(contributor.trim())}</span>
                        <button
                          onClick={() => handleRemoveContributor(contributorsEvent.event_id, contributor.trim())}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Remove contributor"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No contributors yet</p>
                  )}
                </div>
              </div>

              {/* Owner/Admin Section: Add Contributor + Pending Requests */}
              {(isAdmin || idea?.email === userEmail) ? (
                <>
                  {/* Pending Requests Section */}
                  {pendingRequests.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h3 className="text-lg font-semibold text-white">Pending Requests ({pendingRequests.length})</h3>
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {request.requester_picture && (
                                  <img src={request.requester_picture} alt="" className="w-8 h-8 rounded-full" />
                                )}
                                <div>
                                  <p className="text-white font-semibold">{request.requester_name || request.requester_email}</p>
                                  <p className="text-gray-400 text-xs">{request.requester_email}</p>
                                </div>
                              </div>
                              {request.message && (
                                <p className="text-gray-300 text-sm mt-2">{request.message}</p>
                              )}
                              <p className="text-gray-500 text-xs mt-2">
                                Requested {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request.id)}
                                className="bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                </>
              ) : (
                /* Regular User Section: Request to Contribute */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Join This Project</h3>
                  {contributorsEvent?.contributors?.split(',').map(c => c.trim()).includes(userEmail) ? (
                    <div className="bg-green-900/20 border border-green-500/30 text-green-200 p-4 rounded-lg">
                      <p className="font-semibold">You are already a contributor on this project!</p>
                    </div>
                  ) : hasRequestedToContribute ? (
                    <div className="bg-blue-900/20 border border-blue-500/30 text-blue-200 p-4 rounded-lg">
                      <p className="font-semibold">Your request is pending</p>
                      <p className="text-sm mt-1">The project owner will review your request soon.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm">
                        Want to contribute to this project? Send a request to the project owner.
                      </p>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Optional: Tell them why you want to contribute..."
                        className="w-full bg-slate-700/50 text-white border border-slate-600/50 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                      />
                      <button
                        onClick={handleRequestToContribute}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                      >
                        🙋 Request to Contribute
                      </button>
                    </>
                  )}
                </div>
              )}

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
