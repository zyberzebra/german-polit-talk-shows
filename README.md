# 📺 German Political Talkshows API

A modern API and web interface for tracking German political talk shows. Get real-time information about shows like Markus Lanz, Anne Will, Hart aber Fair, and more.

## Features

- 🔄 Real-time data from TV program RSS feeds
- 📱 Responsive web interface
- 🌐 RESTful API
- 🇩🇪 German political talk show focus
- ⚡ Fast and lightweight

## Quick Start

```bash
# Install dependencies
npm install

# Copy example config and adjust values
cp config.example.js config.local.js
# Edit config.local.js and set your RSS_URL

# Start the server
npm start

# Server runs on http://localhost:3000
```

You can also use environment variables:
```bash
RSS_URL=your_rss_url npm start
```

## API Usage

### Get All Shows

```bash
GET /api/shows
```

Response:
```json
[
  {
    "title": "Markus Lanz",
    "date": "2024-01-31T23:15:00+01:00",
    "description": "Talk show description...",
    "channel": "ZDF",
    "type": "lanz"
  }
  // ... more shows
]
```

## Project Structure

```
├── public/              # Static frontend files
│   ├── index.html      # Main webpage
│   └── client.js       # Frontend JavaScript
├── src/                # Source files
│   └── seo.json        # SEO configuration
├── app.js              # Express application (main entry)
├── talkshow-service.js # TV show data service
├── config.example.js   # Example configuration
├── config.local.js     # Local configuration (not in git)
└── package.json        # Dependencies
```

## Technical Details

- **Backend**: Node.js with Express
- **Data Source**: RSS feed (configured in config.local.js)
- **Parser**: xml2js for RSS parsing
- **Frontend**: Vanilla JavaScript with modern CSS

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy config: `cp config.example.js config.local.js`
4. Edit config.local.js with your settings
5. Start development server: `npm run dev`
6. Visit `http://localhost:3000`

## Contributing

See [TODO.md](TODO.md) for planned features and improvements. Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Acknowledgments

- Data provided by German TV program RSS feeds
- Icons by [Font Awesome](https://fontawesome.com/)
- German TV show information
