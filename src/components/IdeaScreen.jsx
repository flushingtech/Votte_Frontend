import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIdeaById } from '../api/API';
import Navbar from '../components/Navbar';
import ButtonUpload from '../components/ButtonUpload'; // Import here

function IdeaScreen() {
  const { ideaId } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const ideaData = await getIdeaById(ideaId);
        setIdea(ideaData);
      } catch (err) {
        console.error('Error fetching idea details:', err);
        setError('Failed to load idea details');
      } finally {
        setLoading(false);
      }
    };

    if (ideaId) {
      fetchIdea();
    }
  }, [ideaId]);

  if (loading) return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
      <Navbar />
      <p className="text-center mt-10">Loading idea details...</p>
    </div>
  );

  if (error) return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
      <Navbar />
      <p className="text-center mt-10 text-red-500">{error}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh', overflow: 'auto' }}>
      <Navbar />

      <div className="p-3">
        <style>
          {`
            .idea-title-container {
              background-color: #1E2A3A;
              padding: 16px;
              border: 1px solid white;
              text-align: center;
              font-size: 2.2rem;
              font-weight: bold;
              color: white;
              max-width: 700px;
              margin: auto;
              margin-bottom: 10px;
              text-transform: uppercase;
            }

            .idea-details-container {
              max-width: 700px;
              margin: auto;
              background-color: #1E2A3A;
              padding: 16px;
              border: 1px solid white;
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .idea-info {
              font-size: 16px;
              color: #D1D5DB;
            }

            .idea-label {
              font-weight: bold;
              color: white;
            }
          `}
        </style>

        <div className="idea-title-container">{idea?.idea}</div>

        <div className="idea-details-container">
          <p className="idea-info">
            <span className="idea-label">Description:</span> {idea?.description}
          </p>
          <p className="idea-info">
            <span className="idea-label">Tech Stack:</span> {idea?.technologies}
          </p>
          <p className="idea-info">
            <span className="idea-label">Likes:</span> {idea?.likes}
          </p>
          <p className="idea-info">
            <span className="idea-label">Submitted by:</span> {idea?.submitted_by || 'Unknown'}
          </p>
          <p className="idea-info">
            <span className="idea-label">Event:</span> {idea?.event_title || 'N/A'}
          </p>

          {/* Upload image section */}
          <div className="mt-5">
            <h2 className="text-white text-lg mb-2">Upload an image for this idea:</h2>
            <ButtonUpload />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeaScreen;
