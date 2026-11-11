# KhetiGPT Frontend

React/Vite frontend for KhetiGPT, an AI-powered personal farming assistant.
The application uses the backend for authentication, profile data, AI chat,
weather, crop recommendations, fertilizer guidance, and government scheme
reference data.

## Live Demo and Deployment

- **Live frontend:** [kheti-gpt-frontend.vercel.app](https://kheti-gpt-frontend.vercel.app)
- **Backend API:** [khetigpt-backend.onrender.com](https://khetigpt-backend.onrender.com)
- **Backend health check:** [API health](https://khetigpt-backend.onrender.com/api/health)
- **Frontend repository:** [Sumit-jha455/KhetiGPT-Frontend](https://github.com/Sumit-jha455/KhetiGPT-Frontend)
- **Backend repository:** [Sumit-jha455/KhetiGPT-Backend](https://github.com/Sumit-jha455/KhetiGPT-Backend)

The frontend is hosted on **Vercel** and connects to the Node.js backend hosted
on **Render**. The production frontend uses the backend API base URL configured
through the `VITE_API_BASE_URL` environment variable.

## Features

- JWT/session-cookie authentication with protected routes
- Profile and farm information editing
- Groq-backed assistant chat with persisted history
- OpenWeather current conditions and forecast
- Rule-based crop recommendations from the backend
- Fertilizer nutrient and stage guidance from the backend
- Searchable, filterable, paginated government scheme directory
- Dashboard summary using authenticated profile and live weather
- Backend-persisted language preference and local-only UI preferences

## Tech stack

- React 19
- Vite
- JavaScript
- React Router with `HashRouter`
- Tailwind CSS v4
- Axios
- Lucide React

## Structure

```text
src/
  components/       Shared UI components and route guard
  context/          Authentication and profile state
  layouts/          Public, auth, and application layouts
  pages/            Application screens
  services/         Central Axios client and backend service modules
  data/             Static UI configuration and retained demo fixtures
  hooks/            Reusable React hooks
  utils/            Validation, formatting, and class helpers
```

## Installation and commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Backend connection

Create a local frontend `.env` file with the variable name below. Do not
commit secrets or place provider keys in the frontend.

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

If omitted, the Axios client defaults to `http://localhost:5000/api`.
Requests include credentials and use the token stored by the authentication
flow in session storage, or local storage when Remember Me is selected.

For the deployed frontend, configure the same variable in Vercel using the
production backend API URL. Environment variables beginning with `VITE_` are
embedded during the frontend build, so redeploy after changing them.

## Available modules

| Route | Module |
| --- | --- |
| `/login`, `/register` | Authentication |
| `/dashboard` | Profile/farm summary and live weather |
| `/assistant` | Groq assistant and chat history |
| `/weather` | Current weather and forecast |
| `/crop-recommendation` | Backend crop recommendation |
| `/fertilizer` | Backend fertilizer guidance |
| `/schemes` | Scheme search, filters, pagination, and details |
| `/profile` | Backend profile and farm updates |
| `/settings` | Backend language preference and local-only preferences |

`HashRouter` keeps the production build usable from static hosting without
server rewrite rules.

## Mock data policy

Mock files remain in `src/data/` for retained static UI configuration,
fallback/reference content, and backup compatibility. Active assistant,
weather, crop, fertilizer, scheme, authentication, and dashboard data flows
use the backend or authenticated context instead of mock responses.
