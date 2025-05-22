import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIdeaById, checkAdminStatus } from '../api/API';
import Navbar from '../components/Navbar';
import ButtonUpload from '../components/ButtonUpload';

function IdeaScreen() {
  const { ideaId } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ideaData = await getIdeaById(ideaId);
        setIdea(ideaData);

        if (userEmail) {
          const status = await checkAdminStatus(userEmail);
          setIsAdmin(status);
        }
      } catch (err) {
        console.error('Error fetching idea details:', err);
        setError('Failed to load idea');
      } finally {
        setLoading(false);
      }
    };

    if (ideaId) fetchData();
  }, [ideaId, userEmail]);

  if (loading)
    return (
      <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
        <Navbar />
        <p className="text-center mt-10">Loading idea details...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ backgroundColor: '#030C18', minHeight: '100vh', color: '#FFF' }}>
        <Navbar />
        <p className="text-center mt-10 text-red-500">{error}</p>
      </div>
    );

  return (
    <div style={{ backgroundColor: '#030C18', minHeight: '100vh' }}>
      <Navbar />
      <div className="p-3">
        <style>
          {`
            .idea-header-container {
              background-color: #1E2A3A;
              border: 1px solid white;
              padding: 16px;
              max-width: 700px;
              margin: auto;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }

            .idea-title {
              font-size: 2rem;
              font-weight: bold;
              color: white;
              text-transform: uppercase;
            }

            .event-details {
              text-align: right;
              font-size: 0.875rem;
              color: #D1D5DB;
            }

            .idea-details-container {
              max-height: 70vh;
              overflow-y: auto;
              max-width: 700px;
              margin: auto;
              background-color: #1E2A3A;
              padding: 16px;
              border: 1px solid white;
              display: flex;
              flex-direction: column;
              gap: 10px;
              position: relative;
            }

            .idea-info {
              font-size: 16px;
              color: #D1D5DB;
            }

            .idea-label {
              font-weight: bold;
              color: white;
            }

            .idea-image {
              width: 100%;
              height: auto;
              max-height: 400px;
              object-fit: cover;
              border: 1px solid white;
              display: block;
              margin-top: 12px;
              margin-bottom: 16px;
            }

            .bottom-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 20px;
              width: 100%;
            }

            .submitted-by {
              font-size: 0.75rem;
              color: #9CA3AF;
              text-align: right;
            }
          `}
        </style>

        {/* Title + Event Section */}
        <div className="idea-header-container">
          <div className="idea-title">{idea?.idea}</div>
          <div className="event-details">
            {idea?.event_title && <div>{idea.event_title}</div>}
            {idea?.event_date && (
              <div>{new Date(idea.event_date).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="idea-details-container">
          <p className="idea-info">
            <span className="idea-label">Description:</span> {idea?.description}
          </p>
          <p className="idea-info">
            <span className="idea-label">Tech Stack:</span> {idea?.technologies}
          </p>
          <p className="idea-info">
            <span className="idea-label">Contributors:</span>{' '}
            {idea?.contributors ? idea.contributors.split(',').join(', ') : 'None'}
          </p>

          {idea?.image_url && (
            <img
              src={idea.image_url}
              alt="Uploaded for this idea"
              className="idea-image"
            />
          )}

          <div className="bottom-row">
            {isAdmin ? (
              <div>
                {/* <p className="text-white text-sm mb-2">Upload an image for this idea:</p> */}
                <ButtonUpload ideaId={idea?.id} />
              </div>
            ) : (
              <div />
            )}
            <div className="submitted-by">
              Submitted by: {idea?.email || 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeaScreen;
