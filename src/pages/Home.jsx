import React from 'react';
import IdeaList from '../components/IdeaList';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-6 rounded shadow-lg bg-white">
          <h2 className="text-2xl font-bold text-black mb-4">Flushing Tech Meetup Hackathon Ideas</h2>
          <p className="text-lg text-gray-800 mb-6">See the list of ideas suggested. Idea max is 10. If there's still space... add yours. Or feel free to vote.</p>
          <IdeaList />
        </div>
      </div>
    </div>
  );
};

export default Home;
