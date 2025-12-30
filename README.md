# Pastebin-Lite

A robust, high-performance pastebin application built with the latest web technologies. Create, share, and manage text pastes with advanced features like auto-expiration and view limits.

[**Live Demo**](https://pastebin-ebon.vercel.app)

## 🚀 Features

- **Instant Sharing**: Create pastes with arbitrary text and get a unique, shareable URL immediately.
- **Auto-Expiration (TTL)**: Set a Time-To-Live (in seconds) for your pastes. They vanish automatically when the time is up.
- **View Limits**: Restrict the number of times a paste can be viewed. Once the limit is reached, the paste is deleted.
- **Combined Constraints**: Apply both TTL and view limits; the paste expires whichever condition is met first.
- **Secure & Fast**: Built for speed and security with server-side rendering and efficient caching.

## 🛠️ Technology Stack

- **Next.js 16**: Utilizing the latest App Router for server-centric routing and optimized performance.
- **React 19**: Leveraging the newest React features for a seamless UI.
- **TypeScript 5**: Ensuring type safety and code reliability.
- **Redis**: High-performance in-memory key-value store for persistence.
- **Docker**: Containerized for consistent deployment across environments.

## 💡 Architecture & Design Decisions

### Persistence Layer: Redis

I selected **Redis** as the primary data store for several critical reasons:

1.  **Performance**: Redis offers sub-millisecond O(1) read/write latency, which is essential for a high-traffic pastebin service.
2.  **Native TTL Support**: Redis has built-in support for key expiration (`EXPIRE`). This simplifies the "Time-To-Live" feature significantly, as we don't need a separate background worker to clean up expired pastes.
3.  **Atomic Counters**: The `INCR` and `HINCRBY` operations allow for race-condition-free view counting, ensuring that view limits are strictly enforced even under high concurrency.

### Key Design Choices

- **Stateless API**: The application is fully stateless, delegating all state management to Redis. This makes the app horizontally scalable and perfect for serverless platforms (like Vercel) or container orchestration (Kubernetes).
- **URL Structure**: We use a concise `/p/[id]` structure for public paste views to keep URLs short and user-friendly, while the API lives under `/api/pastes`.
- **Deterministic Testing**: Testing time-based features (like TTL) can be flaky. I implemented a `TEST_MODE` that respects a custom `x-test-now-ms` header, allowing our end-to-end tests to "time travel" and verify expiration logic deterministically.

## 📦 Installation & Running

### Option 1: Docker (Recommended)

The easiest way to run the application is with Docker Compose. This sets up both the application and the Redis database automatically.

```bash
# Clone the repository
git clone https://github.com/prakash6855/pastebin.git
cd pastebin

# Start the application
sudo docker-compose up --build
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### Option 2: Manual Setup

If you prefer to run it without Docker:

1.  **Prerequisites**: Ensure you have Node.js 20+ and a running Redis instance.
2.  **Configuration**: Create a `.env` file (or set env vars) with your Redis URL:
    ```env
    REDIS_URL=redis://localhost:6379
    ```
3.  **Install & Run**:
    ```bash
    npm install
    npm run dev
    ```

## 🧪 Testing

We prioritize reliability. The project includes a comprehensive end-to-end (E2E) test suite that verifies every functional requirement.

### Running Tests

Ensure your application is running (via Docker or manually), then execute the test script:

```bash
# Run tests against localhost:3000
node e2e-test.js

# Or target a specific port
BASE_URL=http://localhost:3001 node e2e-test.js
```

### What is Tested?

- **Health Checks**: Verifies API and Database connectivity.
- **Core Flows**: Creating and retrieving pastes (both JSON API and HTML view).
- **Constraint Enforcement**:
  - Verifies pastes expire exactly after the TTL.
  - Verifies pastes become unavailable after the Max Views limit is hit.
  - Verifies combined constraints work as expected.
- **Error Handling**: Checks for 404s on missing/expired pastes and 400s on invalid input.

## 📡 API Reference

### Health Check

- **GET** `/api/healthz`
- Returns: `{ "ok": true }`

### Create Paste

- **POST** `/api/pastes`
- Body: `{ "content": "text", "ttl_seconds": 60, "max_views": 5 }`
- Returns: `{ "id": "...", "url": "..." }`

### Get Paste

- **GET** `/api/pastes/:id`
- Returns: `{ "content": "...", "remaining_views": 3, "expires_at": "..." }`

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run code linting.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
