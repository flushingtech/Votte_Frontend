import AddEvent from '../components/admin/AddEvent';
import ManageIdeas from '../components/admin/ManageIdeas';
import EventsList from '../components/admin/EventsList';
import Navbar from '../components/Navbar';

const AdminPage = () => {
  // Get user email from localStorage (as a fallback)
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  return (
    <div className="bg-[#030C18] text-white min-h-screen">
      {/* Full-width Navbar with Home Button */}
      <Navbar userName={userEmail} backToHome={true} />

      <div className="flex flex-col items-center px-8 mt-4">
        <AddEvent userEmail={userEmail} />

        {/* Side-by-side layout for Events and Ideas sections */}
        <div className="flex flex-wrap justify-between max-w-6xl w-full mt-8">
          <div className="w-full md:w-1/2 p-4">
            <EventsList />
          </div>
          <div className="w-full md:w-1/2 p-4">
            <ManageIdeas userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
