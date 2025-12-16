import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import { getUserProfile, getUserEmailByUsername } from '../api/API';

const ProfilePage = ({ user }) => {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const [viewingEmail, setViewingEmail] = useState(null);
  const [navbarUserName, setNavbarUserName] = useState('');
  const [navbarProfilePicture, setNavbarProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  const isLoggedIn = !!user?.email;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch viewing email from username if provided in URL
        if (urlUsername) {
          const email = await getUserEmailByUsername(urlUsername);
          setViewingEmail(email);
        }

        // Fetch navbar profile (logged-in user)
        if (user?.email) {
          const profile = await getUserProfile(user.email);
          const displayName = profile.name || user.email.split('@')[0];
          // Ensure name never contains @ symbol
          setNavbarUserName(displayName.includes('@') ? displayName.split('@')[0] : displayName);
          setNavbarProfilePicture(profile.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email, urlUsername]);

  if (loading) {
    return (
      <div
        className="flex flex-col min-h-screen relative overflow-hidden"
        style={{
          background: '#000000',
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

        <Navbar userName={navbarUserName} profilePicture={navbarProfilePicture} />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{
        background: '#000000',
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

      <Navbar userName={navbarUserName} profilePicture={navbarProfilePicture} />

      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Profile user={user} viewingEmail={viewingEmail} />
        </div>
      </div>

      {/* Sign In Banner for Non-Logged-In Users */}
      {!isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-md border-t border-blue-500/30 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm sm:text-base">
                  Sign in to see full profile details and project contributions
                </p>
                <p className="text-blue-200 text-xs hidden sm:block">
                  Join to connect with innovators and collaborate on projects
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
    </div>
  );
};

export default ProfilePage;
