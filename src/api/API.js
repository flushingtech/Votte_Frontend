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

// Function to get ideas by event ID (updated to include Most Creative votes)
export const getIdeasByEvent = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/${eventId}`);
    return response.data.ideas.map(idea => ({
      ...idea,
      mostCreativeVotes: idea.most_creative_votes || 0, // Include Most Creative votes
    }));
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

// export const deleteIdea = async (id, email) => {
//   try {
//     const response = await axios.delete(
//       `${import.meta.env.VITE_BASE_URL}/api/ideas/delete-idea/${id}?email=${email}` // Pass email in query
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error deleting idea:', error);
//     throw error;
//   }
// };

export const deleteIdea = async (ideaId, eventId, userEmail) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/ideas/idea/${ideaId}/${eventId}?email=${encodeURIComponent(userEmail)}`,
    { method: 'DELETE' }
  );

  if (!res.ok) {
    throw new Error('Failed to delete idea');
  }

  return res.json();
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
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/${eventId}`);
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
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/events/check-admin`,
      { email }
    );

    console.log("Admin status response:", response.data);
    return response.data.isAdmin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false; // Return false if there's an error
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
      console.log('setEventStage called with:', { eventId, stage });
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/set-stage/${eventId}`, {
          stage,
      });
      console.log('setEventStage response.data:', response.data);
      return response.data.event || response.data; // Return the updated event
  } catch (error) {
      console.error('Error setting event stage:', error);
      throw error;
  }
};

// Function to get the stage of an event
export const getEventStage = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/get-stage/${eventId}`);
    return {
      stage: response.data.stage,
      current_sub_stage: response.data.current_sub_stage || '1',
    };
  } catch (error) {
    console.error('Error fetching event stage:', error);
    throw error;
  }
};

// Function to submit a vote for an idea
export const submitVote = async (ideaId, userEmail, eventId, voteType) => {  // No rating parameter
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/votes/vote`, {
      user_email: userEmail,
      idea_id: ideaId,
      event_id: eventId,
      vote_type: voteType,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting vote:', error.response?.data || error.message);
    throw error;
  }
};


export const unvote = async (userEmail, ideaId, eventId, voteType) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/votes/unvote`, {
      data: { user_email: userEmail, idea_id: ideaId, event_id: eventId, vote_type: voteType },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing vote:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserVote = async (userEmail, eventId, voteType) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/user-vote`, {
      params: { user_email: userEmail, event_id: eventId, vote_type: voteType },
    });

    return response.data.userVote; // Returns idea_id if voted, otherwise null
  } catch (error) {
    console.error('Error fetching user vote:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get all votes for a specific idea
export const getVotesForIdea = async (ideaId, voteType = null) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/idea/${ideaId}`, {
      params: voteType ? { vote_type: voteType } : {}, // Filter by vote_type if provided
    });

    return response.data.votes;
  } catch (error) {
    console.error('Error fetching votes for idea:', error);
    throw error;
  }
};

// Function to transition the event to Results Time (stage 3) (updated to include Most Creative results)
export const setEventToResultsTime = async (eventId) => {
  try {
    // Set event to Stage 3 (Results Time)
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/set-results-time/${eventId}`);

    // Determine winners automatically
    await determineWinners(eventId);

    // Fetch the results after determining winners
    const results = await getEventResults(eventId);

    return { event: response.data.event, results }; // Returns event and winners
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

// Function to set the sub-stage of an event (1.1 -> 1.2 or vice versa)
export const setEventSubStage = async (eventId, subStage) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/set-sub-stage/${eventId}`, {
      sub_stage: subStage,
    });
    return response.data.event; // Return updated event
  } catch (error) {
    console.error("Error setting event sub-stage:", error);
    throw error;
  }
};

// Function to determine winners for an event (Most Creative, Most Technical, Most Impactful)
export const determineWinners = async (eventId) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/votes/determine-winners`, {
      event_id: eventId,
    });

    return response.data; // Returns { message, winners }
  } catch (error) {
    console.error('Error determining winners:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get results (winners) for an event
export const getEventResults = async (eventId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/results`, {
      params: { event_id: eventId },
    });

    return response.data.results; // Returns an array of winners
  } catch (error) {
    console.error('Error fetching event results:', error.response?.data || error.message);
    throw error;
  }
};

export const addContributorToIdea = async (ideaId, contributorEmail) => {
  try {
    const url = `${import.meta.env.VITE_BASE_URL}/api/ideas/${ideaId}/add-contributor`;
    console.log("📢 Sending request to:", url, "with data:", { contributor_email: contributorEmail });

    const response = await axios.put(url, { contributor_email: contributorEmail });
    console.log("✅ Contributor added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding contributor:", error.response?.data || error.message);
    throw error;
  }
};

// Function to get ideas where the user is a contributor
export const getContributedIdeas = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/contributed/${email}`);
    return response.data.ideas;
  } catch (error) {
    console.error('❌ Error fetching contributed ideas:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get the total number of ideas the user contributed to
export const getContributedIdeaCount = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/contributed-count/${email}`);
    return response.data.contributedCount;
  } catch (error) {
    console.error('Error fetching contributed idea count:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get total number of votes received by a user (authored + contributed ideas)
export const getTotalVotesForUser = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/votes/total-votes/${email}`);
    return response.data.totalVotes;
  } catch (error) {
    console.error('Error fetching total votes for user:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get the number of hackathon wins (as owner or contributor)
export const getHackathonWins = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/hackathon-wins/${email}`);
    return response.data.totalWins;
  } catch (error) {
    console.error('Error fetching hackathon wins:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get detailed hackathon wins (event title + date)
export const getHackathonWinsDetails = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/hackathon-wins-details/${email}`);
    return response.data.wins;
  } catch (error) {
    console.error('Error fetching hackathon win details:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/all-users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const checkInToEvent = async (eventId, email) => {
  const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/events/${eventId}/check-in`, {
    email,
  });
  return res.data;
};

export const getPreviousProjects = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/ideas/previous-projects`);
    return response.data; // or response.data.ideas if you wrap it on the backend
  } catch (error) {
    console.error('Error fetching previous projects:', error);
    throw error;
  }
};

export const addIdeaToEvent = async (ideaId, eventId, description, technologies, is_built) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/ideas/add-event-to-idea/${ideaId}`, {
      event_id: eventId,
      description,
      technologies,
      is_built
    });
    return response.data;
  } catch (error) {
    console.error("Error adding idea to event:", error.response?.data || error.message);
    throw error;
  }
};

export const getJoinDate = async (email) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/join-date/${email}`);
    return _formatDate(response.data.joinDate);
  } catch (error) {
    console.error('Error fetching start date: ', error.response?.data || error.message);
    throw error;
  }
};

function _formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);

  const day = date.getDate();
  const ordinal = 
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th';

    return formatted.replace(/\b(\d{1,2})\b/,
    `${day}${ordinal}`
  );
}