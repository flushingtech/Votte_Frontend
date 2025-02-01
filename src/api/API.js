import axios from 'axios';

// Function to submit an idea associated with a specific event
export const submitIdea = async (email, idea, description, technologies, event_id, is_built = false) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/submitIdea`, {
      email,
      idea,
      description,
      technologies,
      event_id,
      is_built,  // Include is_built field
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Function to get all ideas
export const getIdeas = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/allIdeas`);
    return response.data.ideas;
  } catch (error) {
    throw error;
  }
};

// Function to get ideas by event ID
export const getIdeasByEvent = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/${eventId}`);
    return response.data.ideas;
  } catch (error) {
    console.error('Error fetching ideas by event:', error);
    throw error;
  }
};

// Function to edit an idea
export const editIdea = async (id, idea, description, technologies) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/ideas/editIdea/${id}`, {
      idea,
      description,
      technologies,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteIdea = async (id, email) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/ideas/delete-idea/${id}`, {
      data: { email }, // Pass the email in the request body
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
};

// Function to like an idea
export const likeIdea = async (ideaId, email) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/like/${ideaId}`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to unlike an idea
export const unlikeIdea = async (ideaId, email) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/unlike/${ideaId}`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to get ideas the user has liked
export const getLikedIdeas = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/likedIdeas/${email}`);
    return response.data.likedIdeaIds;
  } catch (error) {
    throw error;
  }
};

// Function to add a new event (only if user is an admin)
export const addEvent = async (email, title, eventDate) => {
  const isAdmin = await checkAdminStatus(email);
  if (!isAdmin) {
    throw new Error('Unauthorized access: User is not an admin');
  }
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/events/add-event`, { email, title, eventDate });
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

// Function to get all events
export const getEvents = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/all-events`);
    return response.data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to delete an event
export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/events/delete-event/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const getIdeasForEvent = async (eventId) => {
  if (!eventId) {
    console.error("Event ID is missing");
    throw new Error("Event ID is required");
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/events/${eventId}/ideas`
    );
    return response.data.ideas;
  } catch (error) {
    console.error("Error fetching ideas for event:", error);
    throw error;
  }
};


export const getUserIdeas = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/user/${email}`);
    return response.data.ideas;
  } catch (error) {
    console.error('Error fetching user ideas:', error);
    throw error;
  }
};

export const getLikedIdeasByUser = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/liked/${email}`);
    return response.data.ideas;
  } catch (error) {
    console.error('Error fetching liked ideas:', error);
    throw error;
  }
};

// Function to check if a user is an admin
export const checkAdminStatus = async (email) => {
  try {
    // Explicitly allow access for a hardcoded admin email
    const hardcodedAdminEmail = "tkhattab1999@gmail.com";
    if (email === hardcodedAdminEmail) {
      return true; // Hardcoded admin
    }

    // Fallback to backend API check
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/events/check-admin`,
      { email }
    );
    return response.data.isAdmin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
};


// Function to set the stage of an idea
export const setIdeaStage = async (ideaId, stage) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/ideas/set-stage/${ideaId}`, {
      stage, // Pass the target stage
    });
    return response.data.idea; // Return the updated idea
  } catch (error) {
    console.error('Error setting idea stage:', error);
    throw error;
  }
};

// Function to set the stage of an event
export const setEventStage = async (eventId, stage) => {
  try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          stage,
      });
      return response.data.event; // Return the updated event
  } catch (error) {
      console.error('Error setting event stage:', error);
      throw error;
  }
};

// Function to get the stage of an event
export const getEventStage = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/get-stage/${eventId}`);
    return response.data; // Returns { stage: <number> }
  } catch (error) {
    console.error('Error fetching event stage:', error);
    throw error;
  }
};

// Function to submit a vote for an idea
export const submitVote = async (ideaId, userEmail, rating) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/votes/vote`, { // Updated endpoint
      user_email: userEmail, // Match the backend parameter
      idea_id: ideaId, // Match the backend parameter
      rating, // Pass the user's rating
    });
    return response.data; // Return the response data for further use
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

// Function to get all votes for a specific idea
export const getVotesForIdea = async (ideaId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/idea/${ideaId}`);
    return response.data.votes; // Return an array of votes for the idea
  } catch (error) {
    console.error('Error fetching votes for idea:', error);
    throw error;
  }
};

// Function to get all votes by a specific user
export const getUserVotes = async (userEmail) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/user/${userEmail}`);
    return response.data.votes; // Return an array of votes by the user
  } catch (error) {
    console.error('Error fetching user votes:', error);
    throw error;
  }
};

// Function to transition the event to Results Time (stage 3)
export const setEventToResultsTime = async (eventId) => {
  try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/set-results-time/${eventId}`);
      return response.data.event; // Return the updated event
  } catch (error) {
      console.error('Error transitioning to Results Time:', error);
      throw error;
  }
};

// Function to update latest scores for all ideas
export const updateAverageScores = async () => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/votes/update-average-scores`
    );
    return response.data; // Returns success message
  } catch (error) {
    console.error('Error updating average scores:', error);
    throw error;
  }
};

// Function to get a single idea by its ID
export const getIdeaById = async (ideaId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/idea/${ideaId}`);
    return response.data.idea;
  } catch (error) {
    console.error('Error fetching idea details:', error);
    throw error;
  }
};
