import { useEffect, useState } from 'react';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';

// Function to decode JWT manually
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function Home() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = decodeToken(token);
      const userEmail = decodedToken?.email || 'Guest';
      setUserName(userEmail);
      localStorage.setItem('userEmail', userEmail);  // Store email in local storage
    }
  }, []);

  return (
    <div className="home-page" style={{ backgroundColor: '#FFE4CE', minHeight: '100vh' }}>
      <Navbar userName={userName} />
      <EventsList />  {/* You don’t need to pass email here since it’s in local storage */}
      <hr />
    </div>
  );
}

export default Home;
