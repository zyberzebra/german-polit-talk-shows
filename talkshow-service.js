const axios = require("axios");

// Cache implementation
let cache = {
  data: null,
  timestamp: null
};

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Configuration from environment variables
const config = {
  api: {
    url: process.env.API_URL,
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
    userAgent: process.env.API_USER_AGENT
  }
};

// Channel ID to name and URL mapping
const CHANNEL_NAMES = {
  71: { name: 'Das Erste', url: 'https://www.ardmediathek.de/live' },
  37: { name: 'ZDF', url: null },
  38: { name: 'RTL', url: null },
  39: { name: 'SAT.1', url: null },
  40: { name: 'ProSieben', url: null },
  41: { name: 'VOX', url: null },
  42: { name: 'RTL II', url: null },
  47: { name: 'NDR', url: null },
  56: { name: 'Phoenix', url: null },
  100: { name: 'ARD-alpha', url: null },
  770: { name: 'WELT', url: null },
  12046: { name: 'Sky Sport News', url: null },
  12178: { name: 'Sky Sport News', url: null },
  262: { name: 'ServusTV', url: null },
  1192: { name: 'Deutschlandfunk', url: null },
  153: { name: 'BR', url: null },
  67: { name: 'BBC World News', url: null },
  280: { name: 'ERF', url: null },
};

/**
 * List of German political talk shows to track
 * @type {Array<{name: string, patterns: string[], url?: string}>}
 */
const TALKSHOWS = [
  { name: "hart aber fair", patterns: ["hart aber fair"], url: null },
  { name: "maischberger", patterns: ["maischberger"], url: null },
  { name: "markus lanz", patterns: ["markus lanz"], url: null },
  { name: "anne will", patterns: ["anne will"], url: null },
  { name: "unter den linden", patterns: ["unter den linden"], url: null },
  { name: "talk", patterns: ["talk"], url: null },
  { name: "caren miosga", patterns: ["caren miosga"], url: "https://www.daserste.de/information/talk/caren-miosga/index.html" },
  { name: "talking business", patterns: ["talking business"], url: null },
  { name: "talkwerk", patterns: ["talkwerk"], url: null },
  { name: "meet your master", patterns: ["meet your master"], url: null },
  { name: "talk spezial", patterns: ["talk spezial"], url: null },
  { name: "bbc hard talk", patterns: ["bbc hard talk"], url: null },
  { name: "ndr talk show", patterns: ["ndr talk show"], url: null },
  { name: "sky talk", patterns: ["sky talk"], url: null },
  { name: "erf jess - talkwerk", patterns: ["erf jess", "talkwerk"], url: null }
];

/**
 * Parse a German date string in format "DD.MM | HH:mm" or "heute/morgen | HH:mm" to Date object
 * Handles German timezone (Europe/Berlin) and daylight saving time automatically
 * @param {string} dateStr - Date string in German format
 * @returns {Date} JavaScript Date object in local German time
 * @throws {Error} If date string is invalid
 */
function parseGermanDate(dateStr) {
  try {
    const [datePart, timePart] = dateStr.split(' | ');
    const [hours, minutes] = timePart.split(':');
    
    // Create date object for German timezone
    const now = new Date();
    let date = new Date();
    
    // Set the timezone to German time
    const timeZone = 'Europe/Berlin';
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    if (datePart.includes('.')) {
      // Handle numerical date format (DD.MM)
      const [day, month] = datePart.split('.');
      date.setMonth(parseInt(month) - 1);
      date.setDate(parseInt(day));
    } else {
      // Handle German date words
      switch (datePart.toLowerCase()) {
        case 'heute':
          // Keep today's date
          break;
        case 'morgen':
          date.setDate(date.getDate() + 1);
          break;
        default:
          throw new Error(`Unknown date format: ${datePart}`);
      }
    }

    // Set time components
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Format the date in German timezone
    const parts = formatter.formatToParts(date);
    const values = {};
    for (const part of parts) {
      values[part.type] = part.value;
    }

    // Construct ISO string with correct timezone
    const isoString = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
    return new Date(isoString);
  } catch (error) {
    throw new Error(`Invalid date format: ${dateStr} (${error.message})`);
  }
}

/**
 * Convert Unix timestamp to Date object
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {Date} JavaScript Date object
 */
function unixTimestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}

/**
 * Find matching talk show from the list
 * @param {string} title - Show title to match
 * @returns {{name: string, url: string|null}|null} Matched show info or null if no match
 */
function findMatchingShow(title) {
  const lowerTitle = title.toLowerCase();
  for (const show of TALKSHOWS) {
    if (show.patterns.some(pattern => lowerTitle.includes(pattern))) {
      return {
        name: show.name,
        url: show.url
      };
    }
  }
  return null;
}

/**
 * Fetch and parse political talk shows with caching
 * @returns {Promise<Array<{
 *   title: string,
 *   date: string,
 *   description: string,
 *   channel: string,
 *   channelUrl: string|null,
 *   type: string,
 *   showUrl: string|null,
 *   duration?: number,
 *   image?: string
 * }>>} Array of talk show objects
 * @throws {Error} If fetching or parsing fails
 */
async function getPoliticalTalkshows() {
  // Check if we have valid cached data
  const now = Date.now();
  if (cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_DURATION) {
    console.log('Serving cached shows data');
    return cache.data;
  }

  console.log(`Fetching fresh shows data from API`);
  
  try {
    const response = await axios.get(config.api.url, {
      timeout: config.api.timeout,
      headers: {
        'User-Agent': config.api.userAgent
      }
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Expected array response from API');
    }
    const shows = [];

    for (const channel of response.data) {
      const channelInfo = CHANNEL_NAMES[channel.id] || { 
        name: channel.name || channel.displayName || channel.longName || `Channel ${channel.id}`,
        url: null
      };

      if (channel.broadcasts && Array.isArray(channel.broadcasts)) {
        for (const broadcast of channel.broadcasts) {
          const title = broadcast.title || '';
          const showInfo = findMatchingShow(title);
          
          if (showInfo) {
            shows.push({
              title,
              date: new Date(broadcast.startTime * 1000).toISOString(),
              description: broadcast.description || '',
              channel: channelInfo.name,
              channelUrl: channelInfo.url,
              type: showInfo.name,
              showUrl: showInfo.url,
              duration: broadcast.duration || 0,
              image: broadcast.pic || ''
            });
          }
        }
      }
    }

    // Update cache
    cache.data = shows;
    cache.timestamp = Date.now();

    return shows;
  } catch (error) {
    console.error('Error fetching shows:', error.message);
    throw error;
  }
}

module.exports = { getPoliticalTalkshows };