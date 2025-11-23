import { useEffect, useState, useRef } from 'react';
import {
  getContributedIdeaCount,
  getContributedIdeas,
  getTotalVotesForUser,
  getHackathonWins,
  getHackathonWinsDetails,
  getJoinDate,
  getUserProfile,
  uploadProfilePicture,
  updateUsername,
  updateSocialLinks
} from '../api/API';
import { clearNameCache } from '../utils/displayNames';

const Profile = ({ user }) => {
  const [contributedCount, setContributedCount] = useState(0);
  const [contributedIdeas, setContributedIdeas] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hackathonWins, setHackathonWins] = useState(0);
  const [detailedWins, setDetailedWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [activeWinsCategory, setActiveWinsCategory] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [savingSocials, setSavingSocials] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      try {
        const [count, ideas, votes, wins, winDetails, joinedDate, profile] = await Promise.all([
          getContributedIdeaCount(user.email),
          getContributedIdeas(user.email),
          getTotalVotesForUser(user.email),
          getHackathonWins(user.email),
          getHackathonWinsDetails(user.email),
          getJoinDate(user.email),
          getUserProfile(user.email),
        ]);
        setContributedCount(count);
        setContributedIdeas(ideas || []);
        setTotalVotes(votes);
        setHackathonWins(wins);
        setDetailedWins(winDetails);
        setJoinedDate(joinedDate);
        setProfilePicture(profile.profile_picture);
        setUserName(profile.name || user.email.split('@')[0]);
        setGithubUrl(profile.github_url || '');
        setLinkedinUrl(profile.linkedin_url || '');
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadProfilePicture(user.email, file);
      setProfilePicture(response.imageUrl);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleEditName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      alert('Name cannot be empty');
      return;
    }

    try {
      await updateUsername(user.email, tempName.trim());
      setUserName(tempName.trim());
      setIsEditingName(false);
      // Clear cache so updated name appears everywhere
      clearNameCache();
      // Reload the page to update all instances of the name
      window.location.reload();
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setTempName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSaveSocialLinks = async () => {
    if (!user?.email) return;
    setSavingSocials(true);
    try {
      const updated = await updateSocialLinks(user.email, githubUrl.trim() || null, linkedinUrl.trim() || null);
      setGithubUrl(updated.github_url || '');
      setLinkedinUrl(updated.linkedin_url || '');
    } catch (error) {
      console.error('Error updating social links:', error);
      alert('Failed to update social links');
    } finally {
      setSavingSocials(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container p-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const profileLevel = Math.floor((contributedCount + totalVotes + hackathonWins * 10) / 10);

  const winCategories = [
    { key: 'Hackathon Winner', label: 'Hackathon Wins', gradient: 'from-yellow-900/30 to-orange-900/30', border: 'border-yellow-500/30', accent: 'text-yellow-300' },
    { key: 'Most Creative', label: 'Most Creative', gradient: 'from-pink-900/30 to-red-900/30', border: 'border-pink-500/30', accent: 'text-pink-300' },
    { key: 'Most Impactful', label: 'Most Impactful', gradient: 'from-emerald-900/30 to-teal-900/30', border: 'border-emerald-500/30', accent: 'text-emerald-300' },
    { key: 'Most Technical', label: 'Most Technical', gradient: 'from-blue-900/30 to-indigo-900/30', border: 'border-blue-500/30', accent: 'text-blue-300' },
  ];

  const winsByCategory = winCategories.map(cat => {
    const items = detailedWins.filter(win =>
      cat.key === 'Hackathon Winner'
        ? (win.category === 'Hackathon Winner' || !win.category)
        : win.category === cat.key
    );
    return { ...cat, count: items.length, items };
  });

  // Count distinct events the user participated in (as contributor/owner)
  const participantEvents = new Set();
  contributedIdeas.forEach(idea => {
    if (idea.event_id) {
      idea.event_id
        .toString()
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
        .forEach(id => participantEvents.add(id));
    }
  });
  const participantEventsCount = participantEvents.size;

  return (
    <div className="profile-container p-3 sm:p-4 text-white w-full h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 sm:p-8 mb-4">
        <div className="flex items-start justify-between gap-6">
          {/* Left Section: Profile Picture + Info */}
          <div className="flex items-start gap-6">
            <div className="relative group">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-purple-500/50 shadow-xl"
                />
              ) : (
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-2xl w-28 h-28 flex items-center justify-center border-4 border-purple-500/50 shadow-xl">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="text-3xl font-bold bg-slate-800/80 text-white border border-purple-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button onClick={handleCancelEdit} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-white">
                      {userName}
                    </h2>
                    <button
                      onClick={handleEditName}
                      className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors group"
                      title="Edit name"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
                <div className="flex items-center gap-2 ml-auto text-xs">
                  {editingLinks ? (
                    <>
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-40"
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-40"
                      />
                      <button
                        onClick={handleSaveSocialLinks}
                        disabled={savingSocials}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        {savingSocials ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingLinks(false)}
                        className="p-2 text-gray-400 hover:text-white"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={githubUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1 px-2 py-1 rounded-md ${githubUrl ? 'bg-slate-800/70 text-white hover:bg-slate-700' : 'bg-slate-800/40 text-gray-500'}`}
                      >
                        <span>🐙</span>
                        <span>GitHub</span>
                      </a>
                      <a
                        href={linkedinUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1 px-2 py-1 rounded-md ${linkedinUrl ? 'bg-slate-800/70 text-white hover:bg-slate-700' : 'bg-slate-800/40 text-gray-500'}`}
                      >
                        <span>🔗</span>
                        <span>LinkedIn</span>
                      </a>
                      <button
                        onClick={() => setEditingLinks(true)}
                        className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors"
                        title="Edit social links"
                      >
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-purple-300 text-base font-medium mb-1">
                {hackathonWins > 0 ? 'Hackathon Champion' : 'Innovator'} • Flushing Tech
              </p>
              <p className="text-gray-400 text-sm">
                Member Since {joinedDate}
              </p>

            </div>
          </div>

          {/* Right Section: Profile Level Badge */}
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-400 mb-1">Profile Level</div>
            <div className="text-5xl font-bold text-yellow-400 mb-1">
              {profileLevel}
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full mb-2"></div>
            <div className="text-xs text-gray-400">Next reward: New badge</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {/* Projects Card */}
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-5 hover:scale-105 transition-transform relative overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <div className="text-3xl">💡</div>
            <div className="text-4xl font-bold text-orange-300">{contributedCount}</div>
          </div>
          <div className="text-xs text-orange-200/50 mb-1">+1 this month</div>
          <div className="text-sm font-semibold text-orange-200 mb-2">Projects</div>
          {/* Mini trend line */}
          <svg className="w-full h-6 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,25 Q25,20 50,15 T100,10" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400"/>
          </svg>
        </div>

        {/* Events Participated Card */}
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-5 hover:scale-105 transition-transform relative overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <div className="text-3xl">📅</div>
            <div className="text-4xl font-bold text-cyan-300">{participantEventsCount}</div>
          </div>
          <div className="text-xs text-cyan-200/50 mb-1">Unique events</div>
          <div className="text-sm font-semibold text-cyan-200 mb-2">Events Participated</div>
          {/* Mini trend line */}
          <svg className="w-full h-6 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,20 Q25,18 50,12 T100,8" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"/>
          </svg>
        </div>

        {/* Hackathon Wins Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-transform relative overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <div className="text-3xl">🏆</div>
            <div className="text-4xl font-bold text-purple-300">{hackathonWins}</div>
          </div>
          <div className="text-xs text-purple-200/50 mb-1">Win rate</div>
          <div className="text-sm font-semibold text-purple-200 mb-2">Hackathon Wins</div>
          {/* Mini trend line */}
          <svg className="w-full h-6 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,22 Q25,19 50,13 T100,9" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"/>
          </svg>
        </div>

        {/* Advanced Stats Card */}
        <div className="bg-gradient-to-br from-blue-700/20 to-indigo-700/20 border border-blue-600/30 rounded-xl p-5 hover:scale-105 transition-transform relative overflow-hidden cursor-pointer group" onClick={() => setShowAdvancedStats(true)}>
          <div className="flex items-start justify-between mb-1">
            <div className="text-3xl">📊</div>
            <div className="text-4xl font-bold text-blue-300">
              {contributedCount > 0 ? Math.round((totalVotes / contributedCount) * 10) / 10 : 0}
            </div>
          </div>
          <div className="text-xs text-blue-200/50 mb-1">Avg per project</div>
          <div className="text-sm font-semibold text-blue-200 mb-2">Advanced Stats</div>
          {/* View More Button */}
          <button className="w-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-lg py-1.5 text-xs font-semibold text-blue-200 transition-all group-hover:bg-blue-600/60">
            View More →
          </button>
        </div>
      </div>

      {/* Social Links Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔗</span>
          <h3 className="text-lg font-semibold text-white">Social Links</h3>
          <div className="flex gap-3 ml-auto text-xs">
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white underline">GitHub</a>
            ) : null}
            {linkedinUrl ? (
              <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white underline">LinkedIn</a>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="GitHub profile URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="url"
            placeholder="LinkedIn profile URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveSocialLinks}
            disabled={savingSocials}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
          >
            {savingSocials ? 'Saving...' : 'Save Links'}
          </button>
        </div>
      </div>

      {/* Projects & Wins Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Left Column: My Projects */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💼</span>
            My Projects
            <span className="text-sm font-normal text-gray-400">({contributedIdeas.length})</span>
          </h3>
          {contributedIdeas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-400">No projects yet</p>
              <p className="text-sm text-gray-500 mt-2">Start contributing to events to see your projects here!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {contributedIdeas.map(idea => (
                <div
                  key={idea.id}
                  className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-lg overflow-hidden hover:border-blue-500/40 transition-all cursor-pointer group flex items-stretch min-h-[150px]"
                  onClick={() => window.location.href = `/idea/${idea.id}`}
                >
                  {/* Project Image - Left Side */}
                  {idea.image_url ? (
                    <div className="w-32 flex-shrink-0 overflow-hidden bg-slate-900 flex items-stretch">
                      <img
                        src={idea.image_url}
                        alt={idea.idea}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-32 flex-shrink-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center min-h-[150px]">
                      <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}

                  {/* Project Info - Right Side */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-white font-semibold text-sm line-clamp-1 flex-1">
                          {idea.idea}
                        </h3>
                        <div className="text-xl flex-shrink-0 ml-2">💡</div>
                      </div>

                      {idea.description && (
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                          {idea.description}
                        </p>
                      )}

                      {/* Technologies */}
                      {idea.technologies && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {idea.technologies.split(',').slice(0, 2).map((tech, idx) => (
                            <span key={idx} className="bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                              {tech.trim()}
                            </span>
                          ))}
                          {idea.technologies.split(',').length > 2 && (
                            <span className="text-gray-500 text-xs">
                              +{idea.technologies.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate">{idea.event_title || 'Project'}</span>
                      {idea.likes > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <span>❤️</span>
                          <span>{idea.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Wins */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span>
            Hackathon Victories
            <span className="text-sm font-normal text-gray-400">({detailedWins.length})</span>
          </h3>
          {winsByCategory.every(cat => cat.count === 0) ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏅</div>
              <p className="text-gray-400">No wins yet</p>
              <p className="text-sm text-gray-500 mt-2">Keep participating and you'll earn your first win soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winsByCategory.map(cat => (
                <div
                  key={cat.key}
                  className={`bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-lg p-4 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full bg-white/20" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Category</div>
                      <div className="text-sm font-semibold text-white">{cat.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${cat.accent} min-w-[3rem] text-right`}>{cat.count}</div>
                    <button
                      disabled={cat.count === 0}
                      onClick={() => setActiveWinsCategory(cat)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        cat.count === 0
                          ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Wins Detail Modal */}
      {activeWinsCategory && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setActiveWinsCategory(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 max-w-3xl w-full shadow-2xl pointer-events-auto animate-slide-down">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400">Category</div>
                  <h2 className="text-2xl font-bold text-white">{activeWinsCategory.label}</h2>
                  <p className="text-sm text-gray-400">{activeWinsCategory.count} win(s)</p>
                </div>
                <button
                  onClick={() => setActiveWinsCategory(null)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto space-y-2 pr-2">
                {activeWinsCategory.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No wins in this category yet.</div>
                ) : (
                  activeWinsCategory.items.map(item => (
                    <div
                      key={`${item.event_id}-${item.category || 'main'}`}
                      className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/40 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{item.event_title}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{item.category || 'Hackathon Winner'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Advanced Stats Modal */}
      {showAdvancedStats && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => setShowAdvancedStats(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-full shadow-2xl pointer-events-auto animate-slide-down">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Advanced Statistics</h2>
                  <p className="text-gray-400 text-sm">Detailed insights into your performance</p>
                </div>
                <button
                  onClick={() => setShowAdvancedStats(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {/* Total Votes */}
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">🗳️</div>
                  <div className="text-3xl font-bold text-blue-300">{totalVotes}</div>
                  <div className="text-sm text-gray-400">Total Votes Received</div>
                </div>

                {/* Avg Votes */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-purple-300">
                    {contributedCount > 0 ? Math.round((totalVotes / contributedCount) * 10) / 10 : 0}
                  </div>
                  <div className="text-sm text-gray-400">Avg Votes per Project</div>
                </div>

                {/* Success Rate */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-3xl font-bold text-green-300">
                    {contributedCount > 0 ? Math.round((hackathonWins / contributedCount) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>

                {/* Participation */}
                <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-3xl font-bold text-yellow-300">{contributedCount}</div>
                  <div className="text-sm text-gray-400">Total Participations</div>
                </div>

                {/* Profile Score */}
                <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-3xl font-bold text-indigo-300">{profileLevel}</div>
                  <div className="text-sm text-gray-400">Profile Level</div>
                </div>

                {/* Highest Votes */}
                <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-3xl font-bold text-red-300">
                    {contributedCount > 0 ? Math.round((totalVotes / contributedCount) * 1.5) : 0}
                  </div>
                  <div className="text-sm text-gray-400">Peak Performance</div>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Performance Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Most Active Period</span>
                    <span className="text-purple-400 font-semibold">This Month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Consistency Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-green-400 font-semibold">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Community Rank</span>
                    <span className="text-yellow-400 font-semibold">Top 10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Collaboration Rating</span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <span>⭐⭐⭐⭐</span>
                      <span className="text-gray-500">⭐</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
