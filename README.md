# JDownloader Parser

A modern web application that extracts download links from HTML page sources and generates text files compatible with JDownloader. Built with React and Node.js, featuring a beautiful UI and intelligent caching system.

## Features

- **HTML Source Parsing**: Paste HTML page source and extract all download links
- **URL Fetching**: Automatically fetch and parse HTML from URLs (with rate limiting)
- **Smart Caching**: Local storage caching to avoid repeated requests to rate-limited sites
- **Bulk Selection**: Select all, deselect all, or filter by file extensions (.zip, .rar, .7z)
- **JDownloader Export**: Generate text files with one link per line for JDownloader
- **Clipboard Support**: Copy selected links directly to clipboard
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Deployment**: Easy deployment with Docker and docker-compose

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose

### Deployment

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd jdownloader-parser
   ```

2. **Build and run with Docker Compose:**

   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3001`

### Docker Commands

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove containers and volumes
docker-compose down -v
```

## Manual Setup (Development)

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Install frontend dependencies:**

   ```bash
   npm install
   ```

2. **Install backend dependencies:**

   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Start the development server:**

   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   npm start
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

## Usage

### Method 1: Paste HTML Source

1. Copy the HTML source code from a website (Ctrl+U in most browsers)
2. Paste it into the "HTML Page Source" textarea
3. Click "Parse HTML"
4. Select the links you want to download
5. Export to JDownloader or copy to clipboard

### Method 2: Fetch from URL

1. Enter the website URL in the "Website URL" field
2. Click "Fetch from URL"
3. The app will fetch the HTML and parse it automatically
4. Select and export your desired links

### Features

#### Link Selection

- **Select All**: Select all extracted links
- **Deselect All**: Clear all selections
- **Filter by Extension**: Quickly select files by type (.zip, .rar, .7z)

#### Export Options

- **Export to JDownloader**: Downloads a .txt file with one link per line
- **Copy to Clipboard**: Copies selected links to clipboard for manual pasting

#### Caching

- Results are automatically cached in localStorage
- Cached results are used when fetching the same URL again
- Cache expires after 24 hours
- Use "Clear Cache" to remove all cached data

## API Endpoints

### GET /api/fetch-url

Fetches HTML content from a URL.

**Parameters:**

- `url` (required): The URL to fetch

**Response:**

```json
{
  "html": "<!DOCTYPE html>...",
  "url": "https://example.com",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Rate Limiting

The application implements rate limiting to be respectful to target websites:

- 10 requests per minute per IP address
- Automatic retry with exponential backoff
- User-friendly error messages

## Security Features

- CORS enabled for cross-origin requests
- Input validation and sanitization
- Rate limiting to prevent abuse
- Non-root Docker container
- Health checks for container monitoring

## File Structure

```
jdownloader-parser/
├── public/                 # Static files
├── src/                   # React source code
│   ├── App.js            # Main application component
│   ├── index.js          # React entry point
│   └── index.css         # Global styles
├── server/               # Backend server
│   ├── server.js         # Express server
│   └── package.json      # Server dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Frontend dependencies
└── README.md            # This file
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: The backend server handles CORS automatically. Make sure the server is running on port 3001.

2. **Rate Limiting**: If you see "Rate limit exceeded" errors, wait a minute before making new requests.

3. **Docker Build Issues**: Make sure you have Docker and Docker Compose installed and updated.

4. **Port Already in Use**: Change the port in `docker-compose.yml` if port 3001 is already in use.

### Logs

View application logs:

```bash
# Docker logs
docker-compose logs -f

# Individual container logs
docker logs jdownloader-parser
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs
3. Create an issue on GitHub with detailed information
