import { useState } from "react";
import EventsList from "../components/admin/EventsList";
import IdeasForEvent from "../components/admin/IdeasForEvent";
import Navbar from "../components/Navbar";

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "";

  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="bg-[#030C18] text-white min-h-screen">
      <Navbar userName={userEmail} backToHome={true} />
      <div className="flex flex-col items-center px-8 mt-4">
        {!selectedEvent ? (
          <EventsList onEventSelect={handleEventSelect} />
        ) : (
          <IdeasForEvent
            event={selectedEvent}
            onBack={handleBackToEvents}
            userEmail={userEmail}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
