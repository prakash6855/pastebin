# Pastebin

A simple, lightweight pastebin application for creating and sharing text pastes with optional expiration and view limits.

## Technologies Used

- **Next.js 16**: React framework for full-stack web development
- **React 19**: UI library for building interactive interfaces
- **TypeScript 5**: Typed JavaScript for better code quality
- **Redis**: In-memory data structure store for pastes
- **nanoid**: Library for generating unique paste IDs

## Features

- Create and share text pastes
- Optional time-to-live (TTL) for automatic expiration
- Optional maximum view count before deletion
- Unique URLs for each paste
- RESTful API for programmatic access

## Persistence & Design Decisions

### Persistence Layer: Redis

I chose **Redis** as the persistence layer for this application.

- **Reasoning**: Redis is an in-memory key-value store that is extremely fast, making it ideal for a pastebin service where read/write performance is critical.
- **TTL Support**: Redis has native support for Time-To-Live (TTL) expiration, which simplifies the implementation of the auto-expiry feature.
- **Atomic Operations**: Redis supports atomic increments, which ensures accurate view counting even under concurrent load.

### Design Decisions

- **URL Structure**: The application uses `/p/[id]` for the public view to keep URLs short and user-friendly.
- **Deterministic Testing**: To ensure reliable testing of time-based features (TTL), the application supports a `TEST_MODE` environment variable and an `x-test-now-ms` header to mock the current time.
- **Stateless API**: The API is designed to be stateless, relying on Redis for all shared state, making it suitable for serverless deployments (like Vercel).

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

## Testing

The repository includes a comprehensive end-to-end test script `e2e-test.js` that verifies all functional requirements, including:

- Health checks
- Paste creation and retrieval (API & HTML)
- View limits enforcement
- Time-to-live (TTL) expiration (using deterministic time mocking)
- Error handling and edge cases

### Running Tests Locally

1. Ensure the application is running (e.g., on `http://localhost:3000`).
2. Ensure Redis is accessible.
3. Run the test script:

   ```bash
   # Default (targets localhost:3000)
   node e2e-test.js

   # Custom URL (e.g., if running on port 3001)
   BASE_URL=http://localhost:3001 node e2e-test.js
   ```

   The script will output `PASS` for each test case and `ALL TESTS PASSED!` upon success.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
