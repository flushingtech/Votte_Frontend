import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { getIdeaById, checkAdminStatus, getAllUsers, addContributorToIdeaEvent, removeContributorFromIdeaEvent, getDisplayNames, getUserProfile, createContributorRequest, getPendingRequestsForIdea, acceptContributorRequest, declineContributorRequest } from '../api/API';
import Navbar from '../components/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import ButtonUpload from '../components/ButtonUpload';
import MarkdownWithPlugins from './MarkdownWithPluggins';
import MarkdownPreviewer from './MarkdownPreviewer';
import { extractIdeaId, createIdeaSlug } from '../utils/urlHelpers';
import { cldOptimize } from '../utils/cloudinaryImage';

// Shared award palette — matches the badge colors used on the event page's
// Winners section (gold/amber for the top prize, purple for technical,
// teal for creative, red for impactful).
const AWARD_STYLES = {
  'Hackathon Winner': { icon: '🏆', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Most Creative':    { icon: '🎨', color: 'text-teal-300',  bg: 'bg-teal-500/10',  border: 'border-teal-500/30' },
  'Most Technical':   { icon: '⚡', color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'Most Impactful':   { icon: '🚀', color: 'text-red-300',   bg: 'bg-red-500/10',   border: 'border-red-500/30' },
};
const DEFAULT_AWARD_STYLE = { icon: '🏅', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };

function IdeaScreen() {
  const { ideaId: ideaSlug } = useParams();
  const navigate = useNavigate();

  // Extract numeric ID from slug (handles both "123" and "123-title-jan-2024" formats)
  const ideaId = extractIdeaId(ideaSlug);
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
  const [expandedImage, setExpandedImage] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const editDescRef = useRef(null);
  const fileInputRef = useRef(null);

  // Shared aggregates across all events — used by both the header chips and
  // the right project-summary panel so the numbers can't drift apart.
  const voteTotals = useMemo(() => {
    const events = idea?.events || [];
    return {
      total: events.reduce((s, e) => s + Number(e.votes || 0), 0),
      creative: events.reduce((s, e) => s + Number(e.most_creative_votes || 0), 0),
      technical: events.reduce((s, e) => s + Number(e.most_technical_votes || 0), 0),
      impactful: events.reduce((s, e) => s + Number(e.most_impactful_votes || 0), 0),
    };
  }, [idea]);
  const allAwards = useMemo(() => idea?.events?.flatMap(e => e.awards || []) || [], [idea]);
  const awardCounts = useMemo(() => {
    const counts = {};
    allAwards.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return counts;
  }, [allAwards]);
  const uniqueAwards = useMemo(() => [...new Set(allAwards)], [allAwards]);
  const allContributors = useMemo(() => idea?.events?.flatMap(e =>
    e.contributors ? e.contributors.split(',').map(c => c.trim()).filter(Boolean) : []
  ) || [], [idea]);
  const uniqueContributors = useMemo(() => [...new Set(allContributors)], [allContributors]);
  const eventCount = idea?.events?.length || 0;

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || localStorage.getItem('userEmail') || '';
  const isLoggedIn = !!userEmail;

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

        // Update URL to proper slug format if not already
        if (ideaData && ideaData.events && ideaData.events.length > 0) {
          const firstEvent = ideaData.events[0];
          const properSlug = createIdeaSlug(ideaData.id, ideaData.idea, firstEvent.event_date);

          // Only update if current URL doesn't match the proper slug
          if (ideaSlug !== properSlug) {
            navigate(`/idea/${properSlug}`, { replace: true });
          }
        }

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
  }, [ideaId, userEmail, ideaSlug, navigate]);

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

      // Also refresh the open modal's event so contributors list updates immediately
      const refreshedEvent = ideaData.events?.find(e => e.event_id === contributorsEvent.event_id);
      if (refreshedEvent) setContributorsEvent(refreshedEvent);

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

  // One cohesive right-rail panel: overall votes, awards, contributors, and
  // repositories all live in the same bordered container (per-section thin
  // dividers only) instead of being split into separate floating boxes.
  const ProjectSummaryPanel = () => (
    <aside className="bg-slate-900 border border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-white text-sm font-bold uppercase tracking-wide">Project Summary</h2>
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="text-slate-400 hover:text-white transition-colors"
            title={showAdminPanel ? 'Hide admin controls' : 'Show admin controls'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {voteTotals.total > 0 && (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Total Votes</h3>
            <div className="flex flex-col">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300 text-xs font-medium">All Events</span>
                <span className="text-blue-300 font-bold text-sm tabular-nums">{voteTotals.total}</span>
              </div>
              {voteTotals.creative > 0 && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Creative</span>
                  <span className="text-teal-300 text-xs font-semibold tabular-nums">{voteTotals.creative}</span>
                </div>
              )}
              {voteTotals.technical > 0 && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Technical</span>
                  <span className="text-purple-300 text-xs font-semibold tabular-nums">{voteTotals.technical}</span>
                </div>
              )}
              {voteTotals.impactful > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 text-xs">Impactful</span>
                  <span className="text-red-300 text-xs font-semibold tabular-nums">{voteTotals.impactful}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {uniqueAwards.length > 0 && (
          <div className={voteTotals.total > 0 ? 'pt-4 border-t border-slate-800' : ''}>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Awards ({allAwards.length})</h3>
            <div className="flex flex-col gap-1.5">
              {uniqueAwards.map((award) => {
                const style = AWARD_STYLES[award] || DEFAULT_AWARD_STYLE;
                return (
                  <div key={award} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${style.color}`}>
                      <span>{style.icon}</span>{award}
                    </span>
                    {awardCounts[award] > 1 && (
                      <span className="text-slate-500 text-xs font-bold">×{awardCounts[award]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {uniqueContributors.length > 0 && (
          <div className={(voteTotals.total > 0 || uniqueAwards.length > 0) ? 'pt-4 border-t border-slate-800' : ''}>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Contributors ({uniqueContributors.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {uniqueContributors.map((contributor) => (
                <span
                  key={contributor}
                  className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-xs"
                >
                  {getDisplayName(contributor)}
                </span>
              ))}
            </div>
          </div>
        )}

        {voteTotals.total === 0 && uniqueAwards.length === 0 && uniqueContributors.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-2">No data yet</p>
        )}

        {/* Repositories — kept inside the same panel, not a separate box */}
        <div className={(voteTotals.total > 0 || uniqueAwards.length > 0 || uniqueContributors.length > 0) ? 'pt-4 border-t border-slate-800' : ''}>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Repositories
            </h3>
            {!editingGithubRepos && (
              <button
                onClick={handleEditGithubRepos}
                className="text-blue-400 hover:text-blue-300 transition-colors text-[11px] font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {editingGithubRepos ? (
            <div className="flex flex-col gap-2.5">
              {githubRepos.map((repo, index) => (
                <div key={index} className="bg-slate-800/60 border border-slate-700 p-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-semibold">Repository {index + 1}</span>
                    <button
                      onClick={() => handleRemoveRepo(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remove repository"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={repo.title}
                    onChange={(e) => handleRepoChange(index, 'title', e.target.value)}
                    placeholder="Title (e.g., Frontend, Backend)"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={repo.url}
                    onChange={(e) => handleRepoChange(index, 'url', e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <button
                onClick={handleAddRepo}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                + Add Repository
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveGithubRepos}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingGithubRepos(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (() => {
            try {
              const repos = idea?.github_repo ? JSON.parse(idea.github_repo) : [];
              return Array.isArray(repos) && repos.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {repos.map((repo, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 text-xs font-medium flex-shrink-0">{repo.title}</span>
                      <a
                        href={repo.url.startsWith('http') ? repo.url : `https://${repo.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs truncate transition-colors"
                      >
                        {repo.url}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic">No repositories linked</p>
              );
            } catch {
              return <p className="text-slate-500 text-xs italic">No repositories linked</p>;
            }
          })()}
        </div>

        {isAdmin && showAdminPanel && (
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Admin</h3>
            <ButtonUpload ideaId={idea?.id} />
          </div>
        )}
      </div>
    </aside>
  );

  if (loading)
    return (
      <div className="min-h-screen text-white" style={{ background: '#0a0e1a' }}>
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
      <div className="min-h-screen text-white" style={{ background: '#0a0e1a' }}>
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 30%, #dbeafe 60%, #93c5fd 85%, #3b82f6 100%)' }}>

      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

        <div className="flex flex-1 min-w-0 min-h-0"
          style={{ paddingLeft: sidebarExpanded ? '220px' : '52px', transition: 'padding-left 200ms ease' }}>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-y-auto lg:overflow-hidden gap-3 sm:gap-4 p-4 sm:p-6">

            {/* CENTER — the only scrolling region on desktop */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4 lg:overflow-y-auto lg:min-h-0">

              {/* Message Display */}
              {message && (
                <div className={`p-3 text-sm border ${message.includes('success') || message.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : message.includes('Uploading') ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                  {message}
                </div>
              )}

              {/* PROJECT HEADER */}
              <div className="bg-slate-900 border border-slate-700 p-4">
                <button
                  onClick={() => navigate('/home')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Projects
                </button>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {idea?.idea}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted by: {idea?.email?.split('@')[0] || 'Unknown'}
                </p>
                {(eventCount > 0 || allAwards.length > 0 || voteTotals.total > 0) && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-300">
                    {eventCount > 0 && <span>{eventCount} {eventCount === 1 ? 'Event' : 'Events'}</span>}
                    {allAwards.length > 0 && <span className="text-slate-600">•</span>}
                    {allAwards.length > 0 && <span>{allAwards.length} {allAwards.length === 1 ? 'Award' : 'Awards'}</span>}
                    {voteTotals.total > 0 && <span className="text-slate-600">•</span>}
                    {voteTotals.total > 0 && <span>{voteTotals.total} Total Votes</span>}
                  </div>
                )}
              </div>

              {/* Mobile only: project summary between header and timeline */}
              <div className="lg:hidden">
                <ProjectSummaryPanel />
              </div>

              {/* PROJECT TIMELINE */}
              <div className="bg-slate-900 border border-slate-700 p-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-white flex items-center gap-1.5">
                    <span>🚀</span> Project Timeline
                  </h2>
                  <span className="text-xs text-slate-500">{eventCount} {eventCount === 1 ? 'Event' : 'Events'}</span>
                </div>
                {eventCount > 1 && (
                  <p className="text-xs text-slate-500 mt-1 mb-4">This project has been worked on across multiple events.</p>
                )}
                {eventCount <= 1 && <div className="mb-2" />}

                <div className="relative mt-3">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-slate-800"></div>

                  {/* Event cards with timeline nodes */}
                  {idea?.events?.map((event, index) => {
                    const hasAwards = event?.awards && Array.isArray(event.awards) && event.awards.length > 0;
                    const hasVotes = event?.votes > 0 || event?.most_creative_votes > 0 || event?.most_technical_votes > 0 || event?.most_impactful_votes > 0;
                    const isFirst = index === 0;
                    const isLast = index === idea.events.length - 1;

                    return (
                      <div key={event.event_id} className="relative pl-6 pb-4 last:pb-0">
                        {/* Timeline marker */}
                        <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full border-2 z-10"
                          style={{
                            background: isFirst ? '#34d399' : isLast ? '#60a5fa' : '#64748b',
                            borderColor: isFirst ? '#6ee7b7' : isLast ? '#93c5fd' : '#94a3b8',
                          }}
                        />
                        {eventCount > 1 && (isFirst || isLast) && (
                          <span className={`inline-block mb-1.5 text-[9px] font-bold uppercase tracking-widest ${isFirst ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {isFirst ? 'Start' : 'Latest'}
                          </span>
                        )}

                        {/* Event card */}
                        <div className="bg-slate-900 border border-slate-700 overflow-hidden"
                        >
                    {/* Event Header */}
                    <div className="bg-slate-800/60 border-b border-slate-800 px-3.5 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400 font-semibold">
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {event.title && (
                            <h2 className="text-sm font-bold text-white mt-0.5">{event.title}</h2>
                          )}
                        </div>

                        {/* Admin/Owner Menu - Three Dots */}
                        {isLoggedIn && (idea?.email === userEmail || isAdmin) && (
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={() => setMenuOpenEventId(menuOpenEventId === event.event_id ? null : event.event_id)}
                              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-700/60"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>

                            {menuOpenEventId === event.event_id && (
                              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 shadow-lg py-1 min-w-[150px] z-10">
                                <button
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setMenuOpenEventId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleUploadImage(event.event_id)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                  Upload Image
                                </button>
                                <button
                                  onClick={() => {
                                    setContributorsEvent(event);
                                    setMenuOpenEventId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                  Contributors
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Awards row */}
                      {hasAwards && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {event.awards.map((award, idx) => {
                            const style = AWARD_STYLES[award] || DEFAULT_AWARD_STYLE;
                            return (
                              <div
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-1 border ${style.bg} ${style.border} ${style.color} flex-shrink-0`}
                              >
                                <span className="text-xs">{style.icon}</span>
                                <span className="text-[10px] font-bold whitespace-nowrap">{award}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Content Grid - Compact */}
                    <div className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Image Card */}
                        <div className="bg-slate-900/40 border border-slate-700/50 p-2.5 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg">🖼️</span>
                            <h3 className="text-xs font-bold text-white">Showcase</h3>
                          </div>
                          {event?.image_url ? (
                            <div
                              onClick={() => setExpandedImage(event.image_url)}
                              className="relative cursor-pointer group"
                            >
                              <img
                                src={cldOptimize(event.image_url, { width: 400 })}
                                alt="Project"
                                className="w-full h-36 object-cover shadow-lg group-hover:opacity-90 transition-opacity"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg transition-opacity flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                  Click to expand
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-36 bg-slate-800/50 border border-slate-700/30 flex flex-col items-center justify-center">
                              <span className="text-3xl text-slate-600 mb-1">🖼️</span>
                              <span className="text-slate-500 text-xs">No image yet</span>
                            </div>
                          )}
                        </div>

                        {/* Stats Card */}
                        <div className="bg-slate-900/40 border border-slate-700/50 p-2.5 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg">📊</span>
                            <h3 className="text-xs font-bold text-white">Votes</h3>
                          </div>
                          {hasVotes ? (
                            <div className="space-y-1">
                              {event?.votes > 0 && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                                  <span className="text-slate-400 text-[10px] font-medium">Total</span>
                                  <span className="text-blue-300 font-bold text-xs tabular-nums">{event.votes}</span>
                                </div>
                              )}
                              {event?.most_creative_votes > 0 && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                                  <span className="text-slate-400 text-[10px] font-medium">Creative</span>
                                  <span className="text-teal-300 font-bold text-xs tabular-nums">{event.most_creative_votes}</span>
                                </div>
                              )}
                              {event?.most_technical_votes > 0 && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                                  <span className="text-slate-400 text-[10px] font-medium">Technical</span>
                                  <span className="text-purple-300 font-bold text-xs tabular-nums">{event.most_technical_votes}</span>
                                </div>
                              )}
                              {event?.most_impactful_votes > 0 && (
                                <div className="flex items-center justify-between py-1">
                                  <span className="text-slate-400 text-[10px] font-medium">Impactful</span>
                                  <span className="text-red-300 font-bold text-xs tabular-nums">{event.most_impactful_votes}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <span className="text-2xl text-slate-600 mb-1">📊</span>
                              <span className="text-slate-500 text-xs">No votes yet</span>
                            </div>
                          )}
                        </div>

                        {/* Contributors Card - Compact */}
                        <div className="bg-slate-900/40 border border-slate-700/50 p-2.5 hover:border-slate-600/50 transition-all">
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
                                <span className="text-purple-300 border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold">
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
                                        onClick={() => navigate(`/profile/${encodeURIComponent(contributorEmail)}`)}
                                        className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/50 px-1.5 py-0.5 transition-colors cursor-pointer"
                                        title={`View ${displayName}'s profile`}
                                      >
                                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                          {profilePic ? (
                                            <img
                                              src={cldOptimize(profilePic, { width: 50, height: 50 })}
                                              alt={displayName}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                              decoding="async"
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

                              {/* User Status & Actions - Only show when logged in */}
                              {isLoggedIn && (() => {
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
                                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                                      <div className="flex items-center gap-1.5 text-green-400">
                                        <span className="text-xs">✓</span>
                                        <span className="text-[10px] font-medium">You're a contributor</span>
                                      </div>
                                    </div>
                                  );
                                } else if (hasPendingRequest) {
                                  // User has a pending request
                                  return (
                                    <div className="mt-2 pt-2 border-t border-slate-800">
                                      <div className="w-full flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 text-xs font-semibold cursor-default">
                                        <span>Request Pending</span>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // User can request to join
                                  return (
                                    <div className="mt-2 pt-2 border-t border-slate-800">
                                      <button
                                        onClick={() => setContributorsEvent(event)}
                                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                                      >
                                        I worked on this
                                      </button>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Description Card - Full Width */}
                        <div className="md:col-span-2 lg:col-span-3 bg-slate-900/40 border border-slate-700/50 p-2.5 hover:border-slate-600/50 transition-all">
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
                        <div className="md:col-span-2 lg:col-span-3 bg-slate-900/40 border border-slate-700/50 p-2.5 hover:border-slate-600/50 transition-all">
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
                                  className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 text-[10px] font-semibold border border-blue-500/30"
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


            {/* Desktop only: persistent project summary rail, sticky/bounded
                to the viewport, independent from the center's scroll. */}
            <div className="hidden lg:flex lg:flex-col lg:w-[320px] lg:flex-shrink-0 lg:overflow-y-auto lg:min-h-0">
              <ProjectSummaryPanel />
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
                                  <img src={cldOptimize(request.requester_picture, { width: 60, height: 60 })} alt="" className="w-8 h-8 rounded-full" loading="lazy" decoding="async" />
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
                  <h3 className="text-lg font-semibold text-white">I Worked on This</h3>
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
                        Worked on this project? Let the owner know so they can add you as a contributor.
                      </p>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Optional: Describe what you contributed..."
                        className="w-full bg-slate-700/50 text-white border border-slate-600/50 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                      />
                      <button
                        onClick={handleRequestToContribute}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                      >
                        🙋 Submit Request
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

      {/* Sign In Banner for Non-Logged-In Users */}
      {!isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-md border-t border-blue-500/30 shadow-2xl z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm sm:text-base">
                  Sign in to see contributor details and full project information
                </p>
                <p className="text-blue-200 text-xs hidden sm:block">
                  Join to collaborate, vote, and contribute to projects
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {expandedImage && (
        <>
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998]"
            onClick={() => setExpandedImage(null)}
          ></div>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span>Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={cldOptimize(expandedImage, { width: 1400 })}
                alt="Project (expanded)"
                className="w-full h-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IdeaScreen;
