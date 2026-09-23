import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LandingNavbar from '../components/LandingNavbar';
import GoogleLoginButton from '../components/GoogleLoginButton';
import ConnectWithUs from '../components/ConnectWithUs';
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import Footer from '../components/Footer';
import { SiMeetup, SiEventbrite } from 'react-icons/si';
import backgroundImage from '../assets/background.webp';
import lumaIcon from '../assets/luma-icon.png';

const eventListings = [
  { name: 'Meetup', href: 'https://www.meetup.com/flushing-tech', color: '#ED1C40', Icon: SiMeetup },
  { name: 'Luma', href: 'https://luma.com/flushingtech', image: lumaIcon },
  { name: 'Eventbrite', href: 'https://www.eventbrite.com/o/64475661283', color: '#F05537', Icon: SiEventbrite },
];

function Landing() {
  const navigate = useNavigate();
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false);
  const [devEmail, setDevEmail] = useState('flushingtech.nyc@gmail.com');
  const [isLoadingDevLogin, setIsLoadingDevLogin] = useState(false);
  const [devLoginError, setDevLoginError] = useState('');

  // Persist the session, then continue wherever the user was headed before
  // being sent here to log in (e.g. a QR check-in link) — falling back to /home.
  const completeLogin = (data) => {
    localStorage.setItem('authToken', JSON.stringify(data.token));
    localStorage.setItem('user', JSON.stringify({ email: data.user.email }));
    localStorage.setItem('userEmail', data.user.email);

    const redirectTo = localStorage.getItem('postLoginRedirect');
    localStorage.removeItem('postLoginRedirect');
    navigate(redirectTo || '/home');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoadingWithGoogle(true);
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/googlelogin`;
        const { data } = await axios.post(url, { access_token: tokenResponse.access_token });
        completeLogin(data);
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setIsLoadingWithGoogle(false);
      }
    },
    onNonOAuthError: (err) => {
      console.error('Non-OAuth error:', err);
    },
  });

  // Dev-only bypass for when Google OAuth can't be used locally (e.g. localhost
  // isn't an authorized origin yet). Backend 404s this outside of local dev
  // and unless the email is explicitly allow-listed, so this button existing
  // in a dev build is harmless.
  const handleDevLogin = async () => {
    setDevLoginError('');
    setIsLoadingDevLogin(true);
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/dev-login`;
      const { data } = await axios.post(url, { email: devEmail });
      completeLogin(data);
    } catch (error) {
      console.error('Dev login failed:', error);
      setDevLoginError(error.response?.data?.message || 'Dev login failed');
    } finally {
      setIsLoadingDevLogin(false);
    }
  };

  return (
    <>
      <div
        className="relative flex flex-col min-h-screen bg-cover bg-center text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(13, 18, 26, 0.88), rgba(30, 42, 58, 0.85)), url(${backgroundImage})`,
          minHeight: '100vh',
        }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-site_orange/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-site_red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-site_orange/5 via-site_red/3 to-transparent rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>

        <LandingNavbar />

        {/* Main Content */}
        <div className="flex-1 flex items-center w-full px-4 sm:px-8 lg:px-16 pt-28 pb-12 relative z-10">
          <div className="max-w-7xl mx-auto w-full min-w-0 grid grid-cols-1 lg:grid-cols-[1.2fr_0.85fr] gap-12 lg:gap-16 items-center">

            {/* Hero copy */}
            <div className="min-w-0 text-center lg:text-left space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Votte<span className="text-site_orange">.FlushingTech.org</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                We're a vibrant community of tech enthusiasts who come together to connect,
                learn, share and inspire one another &mdash; through workshops, demos,
                presentations, social events, and hands-on hackathons.
              </p>

              <div className="pt-1">
                <p className="text-sm text-gray-400 mb-3">
                  Learn more from our event listings:
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  {eventListings.map(({ name, href, color, Icon, image }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      title={name}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-site_orange/50 pl-2 pr-4 py-2 transition-colors duration-300"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white overflow-hidden shrink-0">
                        {image ? (
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        )}
                      </span>
                      <span className="text-sm font-medium text-white">{name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Sign-in panel */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md p-[2px] overflow-hidden shadow-2xl shadow-black/50 bg-site_orange/50">
                {/* Rotating orange gradient highlight */}
                <div
                  className="absolute top-1/2 left-1/2 w-[300%] h-[300%] animate-border-spin"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0%, #FFC98A 10%, #F29040 20%, transparent 35%)',
                  }}
                />

                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Sign in to continue</h2>
                  <p className="text-sm text-gray-400 mb-8">
                    Log in to browse hackathon projects and ideas, track your submissions, and
                    vote live at our events.
                  </p>

                  <GoogleLoginButton
                    onClick={googleLogin}
                    isLoading={isLoadingWithGoogle}
                  />

                  {import.meta.env.DEV && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Dev bypass (local only)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={devEmail}
                          onChange={(e) => setDevEmail(e.target.value)}
                          placeholder="allow-listed email"
                          className="flex-1 min-w-0 bg-slate-900/60 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-site_orange/50"
                        />
                        <button
                          onClick={handleDevLogin}
                          disabled={isLoadingDevLogin || !devEmail}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 transition-colors disabled:opacity-50"
                        >
                          {isLoadingDevLogin ? '...' : 'Go'}
                        </button>
                      </div>
                      {devLoginError && (
                        <p className="text-xs text-red-400 mt-2">{devLoginError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-site_orange/20 to-transparent"></div>
      </div>

      <UpcomingEventsSection />
      <ConnectWithUs />
      <Footer />
    </>
  );
}

export default Landing;
