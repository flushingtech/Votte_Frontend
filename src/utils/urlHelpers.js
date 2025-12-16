// Helper function to create URL-friendly slugs for ideas
export const createIdeaSlug = (ideaId, ideaTitle, eventDate) => {
  // Create a URL-friendly version of the title
  const titleSlug = ideaTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Format date as month-year
  const date = new Date(eventDate);
  const monthYear = date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  }).toLowerCase().replace(' ', '-');

  // Combine: id-title-month-year
  return `${ideaId}-${titleSlug}-${monthYear}`;
};

// Helper function to extract idea ID from slug
export const extractIdeaId = (slug) => {
  // The ID is always the first part before the first hyphen
  const parts = slug.split('-');
  return parts[0];
};

// Helper function to create URL-friendly slugs for events
export const createEventSlug = (eventId, eventTitle, eventDate) => {
  // Create a URL-friendly version of the title
  const titleSlug = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Format date as month-day-year
  const date = new Date(eventDate);
  const dateSlug = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toLowerCase().replace(/,/g, '').replace(/\s+/g, '-');

  // Combine: id-title-date
  return `${eventId}-${titleSlug}-${dateSlug}`;
};

// Helper function to extract event ID from slug
export const extractEventId = (slug) => {
  // The ID is always the first part before the first hyphen
  const parts = slug.split('-');
  return parts[0];
};
