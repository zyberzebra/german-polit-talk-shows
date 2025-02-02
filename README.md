# German Political Talk Shows API

A simple API that provides information about upcoming German political talk shows.

## Features

- List of upcoming political talk shows
- Show details including title, date, channel, and description
- Automatic timezone handling (Europe/Berlin)
- Channel and show-specific links to media libraries where available

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```
4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### GET /api/shows

Returns a list of upcoming political talk shows.

Response format:
```json
[
  {
    "title": "Show Title",
    "date": "2024-02-02T20:15:00.000Z",
    "description": "Show description",
    "channel": "Channel Name",
    "channelUrl": "https://channel.url",
    "type": "show type",
    "showUrl": "https://show.url",
    "duration": 60
  }
]
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run lint` - Run linter

## Requirements

- Node.js >= 18.0.0
- npm >= 7.0.0

## License

MIT
