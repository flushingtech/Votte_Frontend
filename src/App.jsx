import React, { Suspense, lazy } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { checkAdminStatus } from './api/API';
// Landing is the most common first visit, so it stays in the main bundle.
// Everything else loads on demand — a first-time visitor no longer has to
// download the admin panel, analytics, and every other page up front.
import Landing from './pages/Landing';
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Faq = lazy(() => import('./pages/Faq'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Home = lazy(() => import('./pages/Home'));
const AdminPage = lazy(() => import('./pages/Admin'));
const EventScreen = lazy(() => import('./pages/EventScreen'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const VoteEntry = lazy(() => import('./pages/VoteEntry'));
const IdeasForEvent = lazy(() => import('./components/admin/IdeasForEvent')); // Admin Event Screen
const IdeaScreen = lazy(() => import('./components/IdeaScreen'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PastEvents = lazy(() => import('./components/PastEvents'));
const UpcomingEvents = lazy(() => import('./components/UpcomingEvents'));
const AdminDuplicates = lazy(() => import('./components/AdminDuplicates')); // Admin Duplicates Manager
const AllProjects = lazy(() => import('./pages/AllProjects')); // Admin All Projects Manager
const AllEvents = lazy(() => import('./pages/AllEvents')); // Admin All Events Manager
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0e1a' }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#3b82f6',
      animation: 'app-spin 0.8s linear infinite',
    }} />
    <style>{'@keyframes app-spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);

const getUserEmail = () => {
  // Try Google OAuth key first, then fall back to JWT-decoded key
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.email) return user.email;
  } catch {}
  return localStorage.getItem('userEmail') || null;
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
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Legal / info pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Regular user routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/event/:eventId" element={<EventScreen />} />
          <Route path="/events/:eventId/check-in" element={<CheckIn />} />
          <Route path="/events/:eventId/vote" element={<VoteEntry />} />

          {/* New route for single idea screen */}
          <Route path="/idea/:ideaId" element={<IdeaScreen />} />

          <Route
            path="/profile"
            element={<ProfilePage user={{ email: userEmail }} />}
          />

          {/* Route for viewing other users' profiles */}
          <Route
            path="/profile/:username"
            element={<ProfilePage user={{ email: userEmail }} />}
          />

          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route
            path="/past-events"
            element={<PastEvents />}
          />

          <Route
            path="/upcoming-events"
            element={<UpcomingEvents />}
          />

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
          <Route
            path="/admin/all-events"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AllEvents />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/duplicates"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AdminDuplicates />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/all-projects"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AllProjects />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AdminRequests />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RequireAdmin userEmail={userEmail}>
                <AdminAnalytics />
              </RequireAdmin>
            }
          />
        </Routes>
        </Suspense>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
