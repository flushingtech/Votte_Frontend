import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LandingNavbar from '../components/LandingNavbar';
import GoogleLoginButton from '../components/GoogleLoginButton';
import backgroundImage from '../assets/background.webp'; // Adjust the path as needed (changed to flushingtech.org background)

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
      className="relative flex flex-col justify-center items-center min-h-screen bg-cover bg-center text-white px-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <LandingNavbar />
      <div className="max-w-lg w-full text-left" style={{ marginRight: '20px' }}>
        <h1 className="text-5xl font-bold">
          Welcome to <span style={{ color: '#FF6B35' }}>Votte</span>
        </h1>
        <p className="mt-4 text-lg">
          Submit your ideas and vote on the best ones for our hackathons and tech events!
        </p>
        <div className="mt-6">
          <GoogleLoginButton 
            onClick={googleLogin}
            isLoading={isLoadingWithGoogle}
          />
        </div>
      </div>
    </div>
  );
}

export default Landing;
