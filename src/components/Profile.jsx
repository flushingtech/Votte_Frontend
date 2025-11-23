import { useEffect, useState, useRef } from 'react';
import {
  getContributedIdeaCount,
  getTotalVotesForUser,
  getHackathonWins,
  getHackathonWinsDetails,
  getJoinDate,
  getUserProfile,
  uploadProfilePicture,
  updateUsername
} from '../api/API';
import { clearNameCache } from '../utils/displayNames';

const Profile = ({ user }) => {
  const [contributedCount, setContributedCount] = useState(0);
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
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      try {
        const [count, votes, wins, winDetails, joinedDate, profile] = await Promise.all([
          getContributedIdeaCount(user.email),
          getTotalVotesForUser(user.email),
          getHackathonWins(user.email),
          getHackathonWinsDetails(user.email),
          getJoinDate(user.email),
          getUserProfile(user.email),
        ]);
        setContributedCount(count);
        setTotalVotes(votes);
        setHackathonWins(wins);
        setDetailedWins(winDetails);
        setJoinedDate(joinedDate);
        setProfilePicture(profile.profile_picture);
        setUserName(profile.name || user.email.split('@')[0]);
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

  return (
    <div className="profile-container p-6 text-white max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500"
              />
            ) : (
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-2xl font-bold bg-slate-800/80 text-white border border-purple-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
            </div>
            <p className="text-gray-400 text-sm mt-1">Member since {joinedDate}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Profile Level</div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.floor((contributedCount + totalVotes + hackathonWins * 10) / 10)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">💡</div>
          <div className="text-3xl font-bold text-yellow-400">{contributedCount}</div>
          <div className="text-sm text-gray-300">Ideas</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">🗳️</div>
          <div className="text-3xl font-bold text-green-400">{totalVotes}</div>
          <div className="text-sm text-gray-300">Votes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-purple-400">{hackathonWins}</div>
          <div className="text-sm text-gray-300">Wins</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-blue-400">
            {contributedCount > 0 ? Math.round((totalVotes / contributedCount) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-300">Avg Votes</div>
        </div>
      </div>

      {/* Hackathon Victories */}
      {hackathonWins > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span>
            Hackathon Victories
          </h3>
          <div className="space-y-2">
            {detailedWins.map(win => (
              <div
                key={win.event_id}
                className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between hover:border-yellow-500/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{win.event_title}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(win.event_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-3xl">🥇</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
