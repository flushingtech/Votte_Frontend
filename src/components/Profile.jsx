import { useEffect, useState } from 'react';
import { getContributedIdeaCount, getTotalVotesForUser } from '../api/API';

const Profile = ({ user }) => {
    const [contributedCount, setContributedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        if (!user?.email) return;

        const fetchStats = async () => {
            try {
                const [count, votes] = await Promise.all([
                    getContributedIdeaCount(user.email),
                    getTotalVotesForUser(user.email),
                ]);
                setContributedCount(count);
                setTotalVotes(votes);
            } catch (error) {
                console.error('Error fetching profile stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.email]);

    return (
        <div className="profile-container relative flex flex-col h-full">
            {/* Sticky Header */}
            <div className="p-2 border shadow-md bg-[#1E2A3A] border-white sticky top-0 z-10">
                <h2 className="text-xl sm:text-lg font-bold text-white text-center">My Profile</h2>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                {loading ? (
                    <p className="text-sm text-center">Loading your stats...</p>
                ) : (
                    <div>
                        <div className="p-4 bg-white border-2 border-[#1E2A3A] rounded shadow-md">
                            <h3 className="text-lg font-semibold text-[#1E2A3A] mb-2">Total Contributions</h3>
                            <p className="text-2xl font-bold text-green-600">{contributedCount}</p>
                        </div>

                        <div className="p-4 bg-white border-2 border-[#1E2A3A] rounded shadow-md">
                            <h3 className="text-lg font-semibold text-[#1E2A3A] mb-2">Total Votes Received</h3>
                            <p className="text-2xl font-bold text-blue-600">{totalVotes}</p>
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
};

export default Profile;
