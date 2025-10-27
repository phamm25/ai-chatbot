# Chatbot Server

## Overview

This server powers the multimodal chatbot experience. It follows the service-controller-route layering pattern from `mmenu-api` and keeps the codebase ready for horizontal scaling. The runtime is Node.js with TypeScript and Express. The server provides endpoints to:

- Manage chat sessions and persist in-memory histories
- Stream questions to OpenAI's ChatGPT models
- Accept image uploads and expose presigned-style relative URLs
- Accept CSV uploads (file or remote URL), parse datasets, and generate statistical summaries
- Provide structured metadata to the client UI

## Architecture

```
src/
├── config/        # environment, logger, openai client, storage helpers
├── constants/     # shared enums and constant maps
├── controllers/   # request handling layer
├── datasets/      # in-memory dataset cache helpers
├── middlewares/   # express middlewares (error handler, validators, upload)
├── routes/        # express routers grouped by resource
├── services/      # business logic, orchestrate OpenAI + storage
├── sessions/      # in-memory session store implementation
├── types/         # TypeScript types shared between layers
├── utils/         # reusable helpers (id, response, async wrappers)
└── validations/   # Joi schemas for runtime validation
```

- Controllers only orchestrate services and format responses.
- Services contain business logic and are written with observability, caching, and resiliency in mind.
- Middleware enforce validation and consistent error handling.

### Observability & Reliability
- Structured logging with `pino`
- Central error handling surface-level metrics
- Input validation via `Joi`
- Configurable upload limits and OpenAI timeout controls

### Storage
Uploaded artifacts are stored locally under `storage/images` and `storage/csv`. The storage path is configurable and isolated within the project folder to keep the chatbot module self-contained.

## Getting Started

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

By default the server runs on `http://localhost:3001`.

### Available Scripts
- `npm run dev` – Start the development server with hot reload via `ts-node-dev`
- `npm run build` – Compile TypeScript to JavaScript into `dist`
- `npm start` – Run the compiled server
- `npm run lint` – Lint all source files using ESLint (Airbnb base + Prettier)
- `npm test` – Placeholder script for future automated tests

## Key Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/sessions` | Create a new chat session |
| GET | `/api/sessions/:id` | Fetch session metadata and history |
| POST | `/api/sessions/:id/messages` | Send a prompt and receive the assistant reply |
| POST | `/api/uploads/images` | Upload an image for multimodal chat |
| POST | `/api/uploads/csv` | Upload a CSV file |
| POST | `/api/uploads/csv-url` | Fetch and parse a CSV from a remote URL |

## System Design Notes
- In-memory caches (`sessions`, `datasets`) are encapsulated behind service interfaces so the storage mechanism can later be replaced with Redis or databases without touching controllers.
- CSV analytics are precalculated and cached to avoid recalculating heavy statistics on every question.
- OpenAI calls are wrapped in a service with retryable error types, enabling future circuit breakers or fallbacks.
- The API surface is documented in `../proto/chatbot.proto` for future gRPC compatibility.

## Environment Variables

| Variable | Description |
| -------- | ----------- |
| `PORT` | HTTP server port |
| `OPENAI_API_KEY` | OpenAI API key |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `MAX_UPLOAD_SIZE_MB` | Maximum upload size per file |

## Future Work
- Replace in-memory stores with Redis/Postgres for multi-instance deployments
- Persist structured logs to ELK/Splunk
- Add request-level metrics with Prometheus exporters
- Implement background workers for long-running CSV analytics

