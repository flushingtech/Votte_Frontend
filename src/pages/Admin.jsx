import AddEvent from '../components/admin/AddEvent';
import ManageIdeas from '../components/admin/ManageIdeas';
import EventsList from '../components/admin/EventsList';

const AdminPage = ({ userEmail }) => {
  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#1E2A3A] text-white px-8">
      <AddEvent userEmail={userEmail} />
      <EventsList />
      <ManageIdeas />
    </div>
  );
};

export default AdminPage;
