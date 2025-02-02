const axios = require("axios");
const xml2js = require("xml2js");

// Configuration from environment variables
const config = {
  rss: {
    url: process.env.RSS_URL,
    timeout: parseInt(process.env.RSS_TIMEOUT || '5000'),
    userAgent: process.env.RSS_USER_AGENT || 'German-Talkshows-API/1.0'
  }
};

/**
 * List of German political talk shows to track
 * @type {string[]}
 */
const TALKSHOWS = [
  "lanz",
  "anne will",
  "hart aber fair",
  "maischberger",
  "maybrit illner",
  "phoenix runde",
  "presseclub",
  "farben bekennen",
  "berlin direkt",
  "unter den linden",
  "talk",
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
 * Fetch and parse political talk shows from TV Spielfilm RSS feed
 * @returns {Promise<Array<{
 *   title: string,
 *   date: Date,
 *   description: string,
 *   channel: string,
 *   type: string
 * }>>} Array of talk show objects
 * @throws {Error} If fetching or parsing fails
 */
async function getPoliticalTalkshows() {
  if (!config.rss.url) {
    throw new Error('RSS_URL environment variable is not set');
  }

  try {
    const response = await axios.get(config.rss.url, {
      timeout: config.rss.timeout,
      headers: {
        'User-Agent': config.rss.userAgent
      }
    });

    const result = await new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true
    }).parseStringPromise(response.data);

    if (!result?.rss?.channel?.item) {
      throw new Error("Invalid RSS feed structure");
    }

    return result.rss.channel.item
      .filter(item => {
        const titleParts = item.title?.split(' | ');
        const showName = titleParts[3]?.toLowerCase() || '';
        return TALKSHOWS.some(show => showName.includes(show));
      })
      .map(item => {
        const parts = item.title.split(' | ');
        const date = parseGermanDate(`${parts[0]} | ${parts[1]}`);
        return {
          title: parts[3],
          date: date.toISOString(), // Convert to ISO string for consistent timezone handling
          description: item.description,
          channel: parts[2],
          type: TALKSHOWS.find(show => parts[3].toLowerCase().includes(show))
        };
      });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error(`Failed to fetch TV shows: ${error.message}`);
  }
}

module.exports = { getPoliticalTalkshows };