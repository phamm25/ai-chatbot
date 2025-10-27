# Chatbot Server

The Chatbot server is an Express.js application designed following the service/controller patterns used in `mmenu-api`. It exposes REST APIs to power the chatbot experience, including multi-turn conversation persistence, image and CSV understanding, and OpenAI powered assistant responses.

## Architecture Overview

```
src/
├── config/         # Environment configuration, logging, database, redis clients
├── controllers/    # Express controllers orchestrating requests
├── middlewares/    # Common Express middlewares (auth, errors, context)
├── models/         # Mongoose models for conversations, messages, uploads
├── routes/         # Route definitions (versioned)
├── services/       # Business logic for chat, CSV analytics, uploads
├── utils/          # Helpers (ApiError, catchAsync, response formatter)
└── validations/    # Joi schemas for input validation
```

Key system design choices:
- **MongoDB** stores conversations, messages, and upload metadata for durability and analytics.
- **Redis** caches dataset analytics and stores streaming context for latency reduction.
- **CLS (Continuation Local Storage)** captures per-request context for structured logging and tracing.
- **OpenAI ChatGPT** provides the assistant responses. The server currently exposes ChatGPT as the only selectable model but the design allows future expansion.
- **Layered pattern** (Routes → Controller → Service → Data/External) mirrors `mmenu-api` for easy onboarding and reuse of cross-cutting practices.

## Prerequisites
- Node.js 18+
- MongoDB instance
- Redis instance
- OpenAI API key with access to GPT models

## Environment Variables
Create a `.env` file from the template:

```
cp .env.example .env
# edit values accordingly
```

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default 4000) |
| `MONGODB_URI` | Mongo connection string |
| `REDIS_URL` | Redis connection URI |
| `OPENAI_API_KEY` | OpenAI credential |
| `ALLOWED_ORIGINS` | Comma-separated CORS whitelist |
| `MAX_UPLOAD_SIZE_MB` | Limit for uploads |

## Install & Run

```
npm install
npm run dev
```

The server exposes REST APIs at `http://localhost:4000/api/v1`. Refer to inline Swagger comments (coming soon) or the client integration for usage examples.

## Testing & Linting

```
npm run lint
```

## Folder Independence
The server is completely self-contained under the `chatbot/server` directory and uses only relative imports so it can run independently from the mono repo context.

