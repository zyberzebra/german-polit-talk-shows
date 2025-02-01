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

## Deployment

### Vercel

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Import your forked repository
4. Add the following environment variables in Vercel:
   - `RSS_URL`: Your RSS feed URL
5. Deploy!

The project includes a `vercel.json` configuration file that handles:
- API routes
- Static file serving
- Environment variables
- Build configuration

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy config: `cp config.example.js config.local.js`
4. Edit config.local.js with your settings
5. Start development server: `npm run dev`
6. Visit `http://localhost:3000`

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
│   ├── style.css       # Styles
│   └── client.js       # Frontend JavaScript
├── app.js              # Express application
├── talkshow-service.js # TV show data service
├── config.example.js   # Example configuration
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## Technical Details

- **Backend**: Node.js with Express
- **Data Source**: RSS feed (configured via env)
- **Parser**: xml2js for RSS parsing
- **Frontend**: Vanilla JavaScript with modern CSS
- **Deployment**: Vercel-ready configuration

## Contributing

See [TODO.md](TODO.md) for planned features and improvements. Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by German TV program RSS feeds
- Icons by [Font Awesome](https://fontawesome.com/)
- German TV show information
