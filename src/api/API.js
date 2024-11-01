import axios from 'axios';

// Function to submit an idea associated with a specific event
export const submitIdea = async (email, idea, description, technologies, event_id) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ideas/submitIdea`, {
      email,
      idea,
      description,
      technologies,
      event_id, // Include the event ID to associate the idea with an event
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
    return response.data.ideas; // Return only the ideas
  } catch (error) {
    throw error;
  }
};

// Function to get ideas by event ID
export const getIdeasByEvent = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/${eventId}`);
    return response.data.ideas;  // Ensure you're returning the ideas array
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
      technologies, // Include technologies in the payload
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete an idea
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
    return response.data.votedIdeaIds; // Return only the voted idea IDs
  } catch (error) {
    throw error;
  }
};

// Function to add a new event
export const addEvent = async (email, title, eventDate) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/events/add-event`, {
      email,
      title,
      eventDate,
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

// Function to get all events
export const getEvents = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/all-events`);
    return response.data.events; // Return only the events array
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
