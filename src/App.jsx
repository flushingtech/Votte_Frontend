import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AdminPage from './pages/Admin';
import EventScreen from './pages/EventScreen';
import IdeasForEvent from './components/admin/IdeasForEvent'; // Admin Event Screen
import { checkAdminStatus } from './api/API';

const getUserEmail = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.email || null;
};

const RequireAdmin = ({ children, userEmail }) => {
  const [isAdmin, setIsAdmin] = React.useState(null);

  React.useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const isAdmin = await checkAdminStatus(userEmail);
        setIsAdmin(isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };
    fetchAdminStatus();
  }, [userEmail]);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return React.cloneElement(children, { userEmail });
};

function App() {
  const userEmail = getUserEmail();

  return (
    <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Regular user routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/event/:eventId" element={<EventScreen />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/event/:eventId"
            element={
              <RequireAdmin userEmail={userEmail}>
                <IdeasForEvent userEmail={userEmail} />
              </RequireAdmin>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
