import { useState, useEffect } from 'react';
import { getIdeas, getVotedIdeas } from '../api/API';
import EditIdea from './EditIdea';
import VoteButton from './VoteButton';
import MostPopularBadge from './MostPopularBadge';

function IdeasList() {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingIdeaId, setEditingIdeaId] = useState(null);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [userVotedIdeas, setUserVotedIdeas] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decodedToken = JSON.parse(jsonPayload);
            setCurrentUserEmail(decodedToken.email);
        }

        const fetchIdeas = async () => {
            try {
                const ideasData = await getIdeas();
                setIdeas(ideasData);

                if (currentUserEmail) {
                    const votedIdeasData = await getVotedIdeas(currentUserEmail);
                    setUserVotedIdeas(votedIdeasData);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching ideas:', err);
                setError('Failed to load ideas');
                setLoading(false);
            }
        };

        fetchIdeas();
    }, [currentUserEmail]);

    const handleEditSuccess = (updatedIdea) => {
        setIdeas((prevIdeas) =>
            prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
        );
        setEditingIdeaId(null);
    };

    const mostPopularIdea = ideas.reduce((prev, current) => {
        return prev.votes > current.votes ? prev : current;
    }, ideas[0]);

    if (loading) {
        return <p className="text-center text-gray-500">Loading ideas...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="ideas-list max-w-3xl mx-auto my-4 p-5 space-y-4" style={{ backgroundColor: '#FBE8D8' }}>
            <h2 className="text-2xl font-bold mb-6 text-black">Submitted Ideas</h2>
            {ideas.length === 0 ? (
                <p className="text-center text-gray-500">No ideas have been submitted yet.</p>
            ) : (
                <ul className="space-y-4">
                    {ideas.map((idea) => (
                        <li
                            key={idea.id}
                            className="relative p-2 shadow hover:shadow-md transition-shadow duration-300 border border-orange-500"
                            style={{ backgroundColor: '#1E2A3A' }}
                        >
                            {/* Display the MostPopularBadge if this is the most popular idea */}
                            {mostPopularIdea && mostPopularIdea.id === idea.id && <MostPopularBadge />}

                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">{idea.idea}</h3>
                                <p className="text-gray-400 text-xs">By: {idea.email}</p>
                            </div>

                            {/* Flex container to align description, technologies, and votes */}
                            <div className="flex justify-between items-center">
                                <div className="max-w-xs">
                                    <p className="text-gray-100 mt-0">{idea.description}</p>
                                    <p className="text-sm text-gray-300">Tech Magic: {idea.technologies}</p> {/* Display technologies */}
                                </div>
                                <p className="text-sm text-gray-300 leading-loose">Votes: {idea.votes}</p>
                            </div>

                            {/* Flex container for Vote and Edit buttons */}
                            <div className="flex items-center justify-between mt-1">
                                <VoteButton
                                    ideaId={idea.id}
                                    currentUserEmail={currentUserEmail}
                                    initialVotes={idea.votes}
                                    hasVoted={userVotedIdeas.includes(idea.id)}
                                    onVoteChange={handleEditSuccess}
                                />

                                {currentUserEmail === idea.email && (
                                    <button
                                        className="h-10 bg-blue-600 text-white py-2 px-4 text-sm font-semibold hover:bg-blue-700 focus:outline-none flex items-center justify-center"
                                        onClick={() => setEditingIdeaId(idea.id)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editingIdeaId === idea.id && (
                                <EditIdea ideaData={idea} onEditSuccess={handleEditSuccess} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default IdeasList;
