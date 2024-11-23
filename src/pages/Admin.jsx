import { useState } from 'react';
import EventsList from '../components/admin/EventsList';
import IdeasForEvent from '../components/admin/IdeasForEvent';
import Navbar from '../components/Navbar';
import AddEvent from '../components/admin/AddEvent';

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false); // State to manage AddEvent modal
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0); // Key to trigger refresh for EventsList

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  const handleAddEventSuccess = () => {
    setShowAddEventModal(false); // Close the modal
    setEventsRefreshKey((prevKey) => prevKey + 1); // Trigger a refresh of the EventsList
  };

  return (
    <div
      className="admin-page flex flex-col"
      style={{ backgroundColor: '#030C18', minHeight: '100vh' }}
    >
      <Navbar userName={userEmail} backToHome={true} />

      {/* Flex container for the main content */}
      <div
        className="flex flex-wrap md:flex-nowrap flex-grow mx-auto p-4 gap-4"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        {/* Left Section: Events List */}
        <div
          className="flex-1 border border-white shadow-sm overflow-y-auto"
          style={{
            padding: '1.5rem',
            width: '100%',
          }}
        >
          {!selectedEvent ? (
            <EventsList
              key={eventsRefreshKey}
              onEventSelect={handleEventSelect}
            />
          ) : (
            <IdeasForEvent
              event={selectedEvent}
              onBack={handleBackToEvents}
              userEmail={userEmail}
            />
          )}
        </div>

        {/* Right Section: Add Event */}
        <div
          className="flex-1 border border-white shadow-sm flex flex-col items-center justify-center"
          style={{
            padding: '1.5rem',
            width: '100%',
          }}
        >
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
            onClick={() => setShowAddEventModal(true)}
          >
            Add New Event
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 max-w-2xl mx-auto rounded-lg space-y-4 w-11/12 md:w-1/2">
              <h2 className="text-2xl font-bold text-white text-center">
                Add New Event
              </h2>
              <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
              <button
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 font-semibold hover:bg-red-700 focus:outline-none"
                onClick={() => setShowAddEventModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
