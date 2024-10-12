import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LandingNavbar from '../components/LandingNavbar';
import GoogleLoginButton from '../components/GoogleLoginButton';

function Landing() {
  const navigate = useNavigate();
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoadingWithGoogle(true);
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/googlelogin`;
        const { data } = await axios.post(url, { access_token: tokenResponse.access_token });
        localStorage.setItem('authToken', JSON.stringify(data.token));
        navigate('/home');
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingWithGoogle(false);
      }
    },
    onNonOAuthError: (err) => {
      console.log(err);
    },
  });

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-[#1E2A3A] text-white px-8">
      <LandingNavbar />
      <div className="max-w-lg w-full text-left" style={{ marginRight: '20px' }}> {/* Added 20px margin to the right */}
        {/* Header Section */}
        <h1 className="text-4xl font-bold">
          Welcome to <span style={{ color: '#FF6B35' }}>Votte</span>
        </h1>
        <p className="mt-4 text-lg">
          Submit your ideas and vote on the best ones for our hackathons and tech events!
        </p>

        {/* Google Login Button */}
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
