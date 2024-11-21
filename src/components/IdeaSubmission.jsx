import { useState } from 'react';
import { submitIdea } from '../api/API';

function IdeaSubmission({ email, eventId, refreshIdeas }) {
  const [idea, setIdea] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [isBuilt, setIsBuilt] = useState(false);
  const [message, setMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();

    if (!idea || !description || !technologies) {
      setMessage('Please fill in all fields: idea, description, and technologies');
      return;
    }

    try {
      const response = await submitIdea(email, idea, description, technologies, eventId, isBuilt);

      if (response.status === 201) {
        setMessage('Idea submitted successfully!');
        setIdea('');
        setDescription('');
        setTechnologies('');
        setIsBuilt(false);
        setIsFormVisible(false);

        if (refreshIdeas) refreshIdeas(); // Trigger refresh for IdeasList
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(error.response.data.message);
      } else {
        console.error('Error submitting idea:', error);
        setMessage('An error occurred while submitting your idea.');
      }
    }
  };

  return (
    <div className="w-full text-center my-6">
      <button
        onClick={() => setIsFormVisible(true)}
        className="bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto"
      >
        Add Idea
      </button>

      {isFormVisible && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 max-w-4xl mx-auto rounded-lg space-y-4 w-11/12 md:w-1/2">
              <h2 className="text-2xl font-bold text-white text-center">Submit Your Idea</h2>
              <form onSubmit={handleIdeaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Your Big Idea:</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your groundbreaking concept."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">A Good Description:</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Clear and intriguing - easy to grasp yet sparks curiosity."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Tech Magic:</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="What cool technologies will you use to bring this to life?"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isBuilt}
                    onChange={(e) => setIsBuilt(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-bold text-gray-300">Is this idea already built?</label>
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

              <button
                onClick={() => setIsFormVisible(false)}
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IdeaSubmission;
