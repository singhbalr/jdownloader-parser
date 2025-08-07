# JDownloader Parser

A modern React web application that extracts download links from HTML page sources and generates text files compatible with JDownloader. Features a beautiful retro gamer UI with advanced search and filtering capabilities.

## Features

- **HTML Source Parsing**: Paste HTML page source and extract all download links from tables
- **Smart Search**: Real-time search by title, URL, or region
- **Advanced Filtering**: Filter by ROM regions (USA, Europe, Japan, etc.) and file types (.zip, .rar, .iso, etc.)
- **Bulk Selection**: Select all, deselect all, or filter by file extensions
- **JDownloader Export**: Generate text files with one link per line for JDownloader
- **Clipboard Support**: Copy selected links directly to clipboard
- **Retro Gamer UI**: Beautiful neon-styled interface with authentic gaming aesthetic
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Deployment**: Easy deployment with Docker and docker-compose

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose

### Production Deployment

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd jdownloader-parser
   ```

2. **Build and run with Docker Compose:**

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost`

### Development Deployment

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

Then access at `http://localhost:3000`

### Docker Commands

```bash
# Production
docker-compose up -d --build
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml up -d --build
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build --force-recreate
```

## Manual Setup (Development)

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Usage

### How to Use

1. **Copy HTML Source**:

   - Go to the website with the file listing
   - Right-click and select "View Page Source" (or press Ctrl+U)
   - Copy the entire HTML source code

2. **Paste and Parse**:

   - Paste the HTML source into the textarea
   - Click "Parse HTML"
   - The app will extract all download links from table structures

3. **Search and Filter**:

   - Use the search bar to find specific files
   - Use region filters (USA, Europe, Japan, etc.)
   - Use file type filters (.zip, .rar, .iso, etc.)

4. **Select and Export**:
   - Check the files you want to download
   - Use "Select All Visible" or filter buttons for bulk selection
   - Export to JDownloader (.txt file) or copy to clipboard

### Features

#### Link Selection

- **Select All Visible**: Select all currently filtered links
- **Deselect All**: Clear all selections
- **Filter by Extension**: Quickly select files by type (.zip, .rar, .7z, etc.)

#### Export Options

- **Export to JDownloader**: Downloads a .txt file with one link per line
- **Copy to Clipboard**: Copies selected links to clipboard for manual pasting

#### Search & Filter

- **Real-time Search**: Search by title, URL, or region
- **Region Filters**: Filter by ROM regions (USA, Europe, Japan, etc.)
- **File Type Filters**: Filter by file extensions (.zip, .rar, .iso, etc.)
- **Combined Filters**: Use multiple filters simultaneously

## ROM Region Detection

The app automatically detects ROM regions from file names using these patterns:

- **USA**: (USA), (US), (United States)
- **Europe**: (Europe), (EU), (PAL)
- **Japan**: (Japan), (JP)
- **Germany**: (Germany), (DE), (Ger)
- **France**: (France), (FR), (Fr)
- **Spain**: (Spain), (ES), (Sp)
- **Italy**: (Italy), (IT), (It)
- **UK**: (UK), (United Kingdom)
- **Canada**: (Canada), (CA), (Can)
- **Australia**: (Australia), (AU), (Aus)
- **Korea**: (Korea), (KR), (Kor)
- **China**: (China), (CN), (Chn)
- **Russia**: (Russia), (RU), (Rus)
- **Brazil**: (Brazil), (BR), (Bra)
- **Multi-Language**: (Multi), (Multi-Lang), (MULTI)
- **World**: (World), (WORLD)

## File Structure

```
jdownloader-parser/
├── public/                 # Static files
├── src/                   # React source code
│   ├── App.js            # Main application component
│   ├── index.js          # React entry point
│   └── index.css         # Retro gamer styling
├── Dockerfile            # Production Docker configuration
├── Dockerfile.dev        # Development Docker configuration
├── docker-compose.yml    # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── nginx.conf            # Nginx configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## Deployment Options

### 1. Docker (Recommended)

```bash
docker-compose up -d --build
```

### 2. Static Hosting

Build the app and deploy to any static hosting service:

```bash
npm run build
# Upload the 'build' folder to your hosting service
```

### 3. Nginx Direct

```bash
npm run build
# Copy build folder to nginx web root
```

## Troubleshooting

### Common Issues

1. **No Links Found**: Make sure you're pasting the complete HTML source, not just the visible page content.

2. **Docker Build Issues**: Make sure you have Docker and Docker Compose installed and updated.

3. **Port Already in Use**: Change the port in `docker-compose.yml` if port 80 is already in use.

4. **CORS Issues**: This app doesn't make external requests, so CORS shouldn't be an issue.

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
