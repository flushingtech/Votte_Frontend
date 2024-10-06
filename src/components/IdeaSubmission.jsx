import { useState } from 'react';
import { submitIdea } from '../api/API';

function IdeaSubmission({ email }) {
  const [idea, setIdea] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState(''); // New state for technologies
  const [message, setMessage] = useState('');

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission

    if (!idea || !description || !technologies) {  // Ensure all fields are filled
      setMessage('Please fill in all fields: idea, description, and technologies');
      return;
    }

    try {
      const response = await submitIdea(email, idea, description, technologies);  // Include technologies in the submission

      if (response.status === 201) {
        setMessage('Idea submitted successfully!');
        setIdea('');
        setDescription('');
        setTechnologies('');  // Clear the technologies field
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(error.response.data.message);  // Show error message from backend
      } else {
        console.error('Error submitting idea:', error);
        setMessage('An error occurred while submitting your idea.');
      }
    }
  };

  return (
    <div className="w-full" style={{ backgroundColor: '#1E2A3A', minHeight: '0vh' }}>
      <div className="p-6 max-w-3xl mx-auto bg-opacity-0 backdrop-filter backdrop-blur-lg rounded-lg space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Submit Your Idea</h2>
        <form onSubmit={handleIdeaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Your Big Idea:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-11"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your groundbreaking concept."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">A Good Description:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clear and intriguing - easy to grasp yet sparks curiosity."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Tech Magic:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-11"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="What cool technologies will you use to bring this to life?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 px-4 font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Submit Idea
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm font-semibold ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default IdeaSubmission;
