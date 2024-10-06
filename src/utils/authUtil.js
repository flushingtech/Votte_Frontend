// src/utils/authUtil.js
export const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };
  
  // Function to fetch token from backend after Google OAuth callback
  export const handleGoogleCallback = async () => {
    try {
      const response = await fetch('http://localhost:5500/auth/google/callback', {
        credentials: 'include',
      });
  
      const data = await response.json();
      console.log(data)
      if (data.success) {
        // Store JWT token in localStorage
        localStorage.setItem('authToken', data.token);
        window.location.href = '/home';  // Redirect to home after login
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };
  