import React, { useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa'; // Import GitHub icon from react-icons

const GitHubRepositories = ({ orgName }) => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`https://api.github.com/orgs/${orgName}/repos`);
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepos();
  }, [orgName]);

  return (
    <div className="github-repositories">
      <h2 className="text-xl font-bold mb-4">GitHub Repositories</h2>
      <div className="grid grid-cols-1 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
          >
            <div className="text-gray-800">
              <FaGithub size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {repo.name}
                </a>
              </h3>
              <p className="text-sm text-gray-600">
                {repo.description || 'No description available'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubRepositories;
