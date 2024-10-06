import { useEffect, useState } from 'react';
import IdeaSubmission from '../components/IdeaSubmission';
import IdeasList from '../components/IdeasList';  // Import the IdeasList component
import Navbar from '../components/Navbar';  // Import the Navbar component

// Function to decode JWT manually
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];  // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);  // Parse the payload as JSON
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function Home() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = decodeToken(token);  // Decode the token manually
      setUserName(decodedToken?.email || 'Guest');  // Set the user's email as the name
      setEmail(decodedToken?.email || '');  // Set the email instead of google_id
      console.log('Email extracted:', decodedToken?.email);  // Log email for debugging
    }
  }, []);

  return (
    <div className="home-page" style={{ backgroundColor: '#FBE8D8', minHeight: '100vh' }}>
      <Navbar userName={userName} />  {/* Add the Navbar component here */}

      {/* Call the IdeaSubmission component and pass the email */}
      <IdeaSubmission email={email} />
      
      <hr />

      {/* Display the list of submitted ideas */}
      <IdeasList />
    </div>
  );
}

export default Home;
