// Home.jsx
import { useEffect, useState } from 'react';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import VotedIdeas from '../components/VotedIdeas';

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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = decodeToken(token);
      const email = decodedToken?.email || 'Guest';
      setUserName(email);
      setUserEmail(email);
      localStorage.setItem('userEmail', email);  // Store email in local storage
    }
  }, []);

  return (
    <div className="home-page" style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar userName={userName} />
      <EventsList />
      
      {/* Flex container for side-by-side sections */}
      <div className="flex flex-wrap justify-between max-w-6xl mx-auto p-6">
        <div className="w-full md:w-1/2 p-4">
          <MyIdeas email={userEmail} />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <VotedIdeas email={userEmail} />
        </div>
      </div>
    </div>
  );
}

export default Home;
