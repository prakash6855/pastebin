# Pastebin

A simple, lightweight pastebin application for creating and sharing text pastes with optional expiration and view limits.

## Technologies Used

- **Next.js 14.2.15**: React framework for full-stack web development
- **React 18**: UI library for building interactive interfaces
- **TypeScript 5**: Typed JavaScript for better code quality
- **Redis**: In-memory data structure store for pastes
- **nanoid**: Library for generating unique paste IDs

## Features

- Create and share text pastes
- Optional time-to-live (TTL) for automatic expiration
- Optional maximum view count before deletion
- Unique URLs for each paste
- RESTful API for programmatic access

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pastebin
   ```

2. Run with Docker (Recommended):

   ```bash
   docker-compose up --build
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

3. Or run manually:

   - Ensure Redis is running locally.
   - Set `REDIS_URL` in `.env` (e.g., `redis://localhost:6379`).
   - Install dependencies and start server:
     ```bash
     npm install
     npm run dev
     ```

## Usage

### Web Interface

- Visit the homepage to create a new paste.
- Enter your text, set optional TTL and max views.
- Share the generated URL.

### API Endpoints

- `GET /api/healthz`: Health check
- `POST /api/pastes`: Create a new paste
- `GET /api/pastes/[id]`: Retrieve a paste by ID

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
