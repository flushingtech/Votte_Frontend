import React from 'react';
import IdeaList from '../components/IdeaList';
import Navbar from '../components/Navbar';
import Header from '../components/Header'; // Import the Header component

const Home = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        <Header /> 
        <div className="p-6 rounded shadow-lg bg-white">
          <IdeaList />
        </div>
      </div>
    </div>
  );
};

export default Home;
