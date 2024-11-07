import { useState, useEffect } from 'react';
import { likeIdea, unlikeIdea } from '../api/API';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function LikeButton({ ideaId, currentUserEmail, initialLikes, hasLiked, onLikeChange }) {
  const [likes, setLikes] = useState(initialLikes);  // Track the like count
  const [liked, setLiked] = useState(hasLiked);  // Track if the user has liked
  const [error, setError] = useState('');

  useEffect(() => {
    setLiked(hasLiked);  // Update the state if props change
  }, [hasLiked]);

  // Handle the like action
  const handleLike = async () => {
    try {
      const response = await likeIdea(ideaId, currentUserEmail);
      setLikes(response.idea.likes);  // Update the like count locally
      setLiked(true);  // Mark as liked
      if (onLikeChange) onLikeChange(response.idea);
    } catch (err) {
      console.error('Error liking the idea:', err);
      setError('Failed to like. You may have reached the like limit.');
    }
  };

  // Handle the unlike action
  const handleUnlike = async () => {
    try {
      const response = await unlikeIdea(ideaId, currentUserEmail);
      setLikes(response.idea.likes);  // Update the like count locally
      setLiked(false);  // Mark as not liked
      if (onLikeChange) onLikeChange(response.idea);
    } catch (err) {
      console.error('Error unliking the idea:', err);
      setError('Failed to unlike.');
    }
  };

  return (
    <div className="like-button flex items-center space-x-2">
      {liked ? (
        <button
          className="text-red-600 hover:text-red-800 focus:outline-none"
          onClick={handleUnlike}
        >
          <FaHeart size={20} /> {/* Filled heart for liked state */}
        </button>
      ) : (
        <button
          className="text-gray-400 hover:text-green-600 focus:outline-none"
          onClick={handleLike}
        >
          <FaRegHeart size={20} /> {/* Outline heart for unliked state */}
        </button>
      )}
      <span className="text-sm text-gray-500">{likes}</span>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

export default LikeButton;
