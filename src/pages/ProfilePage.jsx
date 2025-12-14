import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import { getUserProfile, getUserEmailByUsername } from '../api/API';

const ProfilePage = ({ user }) => {
  const { username: urlUsername } = useParams();
  const [viewingEmail, setViewingEmail] = useState(null);
  const [navbarUserName, setNavbarUserName] = useState('');
  const [navbarProfilePicture, setNavbarProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
};

export default ProfilePage;
