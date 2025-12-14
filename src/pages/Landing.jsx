import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LandingNavbar from '../components/LandingNavbar';
import GoogleLoginButton from '../components/GoogleLoginButton';
import backgroundImage from '../assets/background.jpg';

function Landing() {
  const navigate = useNavigate();
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoadingWithGoogle(true);
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/googlelogin`;
        const { data } = await axios.post(url, { access_token: tokenResponse.access_token });

        // Save token and user email in localStorage
        localStorage.setItem('authToken', JSON.stringify(data.token));
        localStorage.setItem('user', JSON.stringify({ email: data.user.email }));

        navigate('/home'); // Redirect to the home page after successful login
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
  

  return (
    <div 
      className="relative flex flex-col min-h-screen bg-cover bg-center text-white overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 20, 25, 0.7), rgba(26, 35, 50, 0.8)), url(${backgroundImage})`,
        minHeight: '100vh' 
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-blue-500/5 via-purple-500/3 to-transparent rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <LandingNavbar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-fade-in">
                <span className="text-orange-500">Votte</span>
                <span className="text-white">.FlushingTech.org</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Submit your ideas and vote on the best ones for our{' '}
                <span className="text-blue-400 font-semibold">hackathons</span>{' '}
                and{' '}
                <span className="text-purple-400 font-semibold">tech events</span>!
              </p>
            </div>


            {/* Login Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 max-w-md mx-auto hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-300 hover:border-slate-600/70">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                </div>
                
                <GoogleLoginButton 
                  onClick={googleLogin}
                  isLoading={isLoadingWithGoogle}
                />
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to participate in our tech events and hackathons
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  );
}

export default Landing;
