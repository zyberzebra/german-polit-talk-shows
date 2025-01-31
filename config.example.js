/**
 * Example configuration for the German Talkshows API
 * Copy this file to config.local.js and adjust the values
 */
module.exports = {
  // RSS feed configuration
  rss: {
    url: process.env.RSS_URL || "YOUR_RSS_FEED_URL",
    timeout: 5000,
    userAgent: "German-Talkshows-API/1.0"
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'production'
  }
}; 