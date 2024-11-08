import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AdminPage from './pages/Admin';
import EventScreen from './pages/EventScreen';
import EventsList from './components/EventsList';

const adminEmails = ['flushingtech.nyc@gmail.com', 'tkhattab1999@gmail.com', 'admin2@example.com'];

const getUserEmail = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.email || null;
};

function App() {
  const userEmail = getUserEmail();

  const RequireAdmin = ({ children }) => {
    // Ensure the email matches one in the admin list
    if (!adminEmails.includes(userEmail)) {
      return <Navigate to="/" replace />; // Redirect to landing page if not authorized
    }
    return children;
  };

  return (
    <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/event/:eventId" element={<EventScreen />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage userEmail={userEmail} />
              </RequireAdmin>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
