import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Header />
      <div className="mt-6">
        <GoogleLoginButton 
          onClick={googleLogin}
          isLoading={isLoadingWithGoogle}
        />
      </div>
    </div>
  );
}

export default Landing;
