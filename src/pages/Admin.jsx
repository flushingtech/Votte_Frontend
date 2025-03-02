import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsList from '../components/admin/EventsList';
import Navbar from '../components/Navbar';
import AddEvent from '../components/admin/AddEvent';

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

  const navigate = useNavigate(); // Navigation

  const handleAddEventSuccess = () => {
    setEventsRefreshKey((prevKey) => prevKey + 1); // Trigger refresh
  };

  const handleEventSelect = (event) => {
    navigate(`/admin/event/${event.id}`, { state: { event } }); // Navigate with event data
  };

  return (
    <div
      className="admin-page flex flex-col"
      style={{ backgroundColor: '#030C18', minHeight: '100vh' }}
    >
      <Navbar userName={userEmail} backToHome={true} />
      <div
        className="flex flex-wrap md:flex-nowrap flex-grow mx-auto p-4 gap-4"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        {/* Left Section: Add Event and Additional Actions */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex-1 border border-white shadow-sm p-4">
            <h2 className="text-xl font-bold text-white mb-4">Add New Event</h2>
            <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
          </div>
          <div className="flex-1 border border-white shadow-sm p-4">
            <h2 className="text-xl font-bold text-white mb-4">Additional Actions</h2>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Action 1
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Action 2
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Events List */}
        <div className="w-full md:w-1/2 flex-1 border border-white shadow-sm p-4 overflow-y-auto">
          <EventsList key={eventsRefreshKey} onEventSelect={handleEventSelect} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
