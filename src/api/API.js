import axios from 'axios';

// Function to submit an idea
export const submitIdea = async (email, idea, description, technologies) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/submitIdea`, {
      email,
      idea,
      description,
      technologies, // Include the technologies field
    });
    return response;
  } catch (error) {
    throw error;  // Rethrow the error to be handled by the calling function
  }
};

// Function to get all ideas
export const getIdeas = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/allIdeas`);
    return response.data.ideas;  // Return only the ideas
  } catch (error) {
    throw error;  // Rethrow the error to be handled by the calling function
  }
};

// Function to edit an idea
export const editIdea = async (id, idea, description, technologies) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/ideas/editIdea/${id}`, {
      idea,
      description,
      technologies, // Include technologies in the payload
    });
    return response.data;
  } catch (error) {
    throw error;  // Rethrow the error to be handled by the calling function
  }
};

export const deleteIdea = async (id) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/ideas/delete-idea/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
};

// Function to vote for an idea
export const voteForIdea = async (ideaId, email) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/vote/${ideaId}`, {
      email
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to unvote for an idea
export const unvoteForIdea = async (ideaId, email) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/unvote/${ideaId}`, {
      email
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to get ideas the user has voted for
export const getVotedIdeas = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/votedIdeas/${email}`);
    return response.data.votedIdeaIds;  // Return only the voted idea IDs
  } catch (error) {
    throw error;
  }
};