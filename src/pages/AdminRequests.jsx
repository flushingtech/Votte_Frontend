import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ContributorRequests from '../components/admin/ContributorRequests';
import { getUserProfile } from '../api/API';

const AdminRequests = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch {
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{ background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)' }}
    >
      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="bg-gradient-to-r from-emerald-800/60 to-teal-800/60 border border-emerald-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-200">Contributors</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Contributor Requests</h1>
                <p className="text-gray-300 text-sm mt-1">Review and process all pending contributor requests.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl shadow-2xl p-4">
            <ContributorRequests userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
