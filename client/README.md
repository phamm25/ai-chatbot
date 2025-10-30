# Chatbot Client

This Next.js client implements a modern multimodal chat interface. It delivers a bespoke chatbot UI for conversation, image reasoning, and CSV analytics.

## Features
- **Multi-turn chat** with persistent history and live UI updates
- **Image conversation** flow with inline previews and assistant responses grounded on uploaded media
- **CSV analysis** through direct uploads or remote URLs, with on-screen summaries
- **Theme toggle** offering dark and light experiences inspired by popular chat tools
- **Responsive layout** ready for desktop usage

## Project Structure
```
src/
├── api/          # REST client wrappers
├── components/   # UI building blocks (message bubbles, composer, header)
├── hooks/        # Custom React hooks (chat session management)
├── pages/        # Next.js pages
├── state/        # Zustand stores for UI state (theme)
├── styles/       # Global Tailwind styles
└── utils/        # Shared helpers (formatting)
```

## Getting Started

```bash
npm install
npm run dev
```

By default the app expects the server to run at `http://localhost:3000/api/v1`. Override via environment variable:

```
NEXT_PUBLIC_CHATBOT_API_BASE_URL=http://localhost:3000/api/v1
```

Create an `.env.local` file and add the variable if you need a different backend endpoint.

## Linting

```
npm run lint
```

## Design Notes
- Uses **TailwindCSS** for rapid styling inspired by world-class chat products
- Separates concerns between data fetching, UI components, and state to align with `mmenu-webqr` conventions
- Provides graceful loading/error states and ensures the folder operates independently with relative paths only

