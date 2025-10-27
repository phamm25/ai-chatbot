# Chatbot Client

## Overview
The client is a Next.js (React) single-page interface inspired by modern conversational UIs. It follows the structural conventions from `mmenu-webqr`—separating reusable UI components, services, and state management. The UI supports:

- Multi-turn chat with streaming indicators
- Image upload with inline previews
- CSV upload (file + URL) with dataset summaries
- Model selection (ChatGPT is available today)
- Light and dark themes with a sticky toggle

## Architecture
```
src/
├── components/      # Reusable UI building blocks
├── context/         # React contexts for global state (theme, chat)
├── layouts/         # Page-level layout wrappers
├── services/        # API clients and integration logic
├── state-manager/   # Reducers and hooks for chat state
├── styles/          # Theme tokens and global styles
├── utils/           # Helper utilities (formatting, adapters)
└── pages/           # Next.js pages (SPA entry point)
```

State flows from the `ChatProvider` context into presentational components. API calls are encapsulated inside `services/apiClient.ts` for consistency with other mmenu front-ends.

## Getting Started
```bash
cd client
cp .env.example .env.local # configure NEXT_PUBLIC_API_BASE_URL if needed
npm install
npm run dev
```

The development server runs on `http://localhost:3000` by default. Update `.env.local` to point the client to the server:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Available Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Create an optimized production build
- `npm start` – Run the production build
- `npm run lint` – Lint the source files with Next.js ESLint config
- `npm test` – Placeholder script for future automated tests

## Design Notes
- Theme tokens mirror leading chatbot experiences with high contrast and comfortable spacing.
- Chat bubbles automatically adapt to light/dark themes using CSS variables.
- File uploads show progress and fallback states to keep the UX responsive.
- The layout is optimized for desktop but gracefully collapses on smaller breakpoints.

## Future Enhancements
- Integrate websocket streaming for incremental assistant responses
- Persist chat sessions via localStorage or server-side storage
- Add chart visualizations for dataset questions using lightweight plotting libraries

