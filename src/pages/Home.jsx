import React from 'react';
import IdeaList from '../components/IdeaList';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import GitHubRepositories from '../components/GitHubRepositories';

const Home = () => {
  const orgName = 'flushingtech';

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-20">
        <Header />
        <div className="flex justify-between mt-8"> {/* Use flex container to position components side by side */}
          <div className="w-3/4 mr-0"> {/* Container for IdeaList, takes half the width */}
            <div className="p-0 rounded shadow-lg">
              <IdeaList />
            </div>
          </div>
          <div className="w-1/4 ml-0 mt-4"> {/* Container for GitHubRepositories, takes half the width */}
            <div className="p-0 rounded shadow-lg">
              <GitHubRepositories orgName={orgName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
