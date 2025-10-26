import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsList from '../components/admin/EventsList';
import Navbar from '../components/Navbar';
import AddEvent from '../components/admin/AddEvent';

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

  const navigate = useNavigate();

  const handleAddEventSuccess = () => {
    setEventsRefreshKey((prevKey) => prevKey + 1);
  };

  const handleEventSelect = (event) => {
    navigate(`/admin/event/${event.id}`, { state: { event } });
  };

  return (
    <div
      className="admin-page flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}
    >
      <div className="sticky top-0 z-50">
        <Navbar userName={userEmail} backToHome={true} />
      </div>

      {/* Welcome Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            ⚙️ Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            Manage events and oversee all hackathon activities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section: Add Event */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 h-fit">
              <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
            </div>

            {/* Right Section: Events List */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 h-[600px]">
              <EventsList key={eventsRefreshKey} onEventSelect={handleEventSelect} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
