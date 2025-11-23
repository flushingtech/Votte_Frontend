import { getDisplayNames } from '../api/API';

// Cache for display names to avoid repeated API calls
const nameCache = new Map();

/**
 * Convert a comma-separated list of emails to a comma-separated list of display names
 * @param {string} contributorsString - Comma-separated email addresses
 * @returns {Promise<string>} - Comma-separated display names
 */
export const getContributorDisplayNames = async (contributorsString) => {
  if (!contributorsString || contributorsString.trim() === '') {
    return '';
  }

  const emails = contributorsString.split(',').map(e => e.trim()).filter(Boolean);

  // Check cache first
  const uncachedEmails = emails.filter(email => !nameCache.has(email));

  // Fetch uncached names
  if (uncachedEmails.length > 0) {
    try {
      const nameMap = await getDisplayNames(uncachedEmails);
      Object.entries(nameMap).forEach(([email, name]) => {
        nameCache.set(email, name);
      });
    } catch (error) {
      console.error('Error fetching display names:', error);
      // If API fails, cache email usernames as fallback
      uncachedEmails.forEach(email => {
        nameCache.set(email, email.split('@')[0]);
      });
    }
  }

  // Return display names
  return emails.map(email => nameCache.get(email) || email.split('@')[0]).join(', ');
};

/**
 * Get display name for a single email
 * @param {string} email - Email address
 * @returns {Promise<string>} - Display name
 */
export const getSingleDisplayName = async (email) => {
  if (!email || email.trim() === '') {
    return '';
  }

  const trimmedEmail = email.trim();

  // Check cache
  if (nameCache.has(trimmedEmail)) {
    return nameCache.get(trimmedEmail);
  }

  // Fetch from API
  try {
    const nameMap = await getDisplayNames([trimmedEmail]);
    const displayName = nameMap[trimmedEmail] || trimmedEmail.split('@')[0];
    nameCache.set(trimmedEmail, displayName);
    return displayName;
  } catch (error) {
    console.error('Error fetching display name:', error);
    const fallback = trimmedEmail.split('@')[0];
    nameCache.set(trimmedEmail, fallback);
    return fallback;
  }
};

/**
 * Clear the name cache (useful when names are updated)
 */
export const clearNameCache = () => {
  nameCache.clear();
};
