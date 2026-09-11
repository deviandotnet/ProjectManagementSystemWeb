# Project Management System Web

React frontend for the Project Planning & Execution Tracking System. The application uses JavaScript/JSX, React 19, Vite 8, React Router, TanStack Query, Axios, MUI, and Tailwind CSS.

## Requirements

- Node.js 24.15.0 or another version supported by the installed Vite release
- npm 11 or newer
- A reachable ProjectManagementSystemAPI instance

## Setup

```sh
npm install
copy .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to the active API launch profile. The default example is:

```dotenv
VITE_API_BASE_URL=http://localhost:5141/api
```

The URL is normalized centrally so `/api` appears exactly once. Vite exposes every `VITE_*` value to browser code; never place signing keys, passwords, or other secrets in these variables.

The backend must allow the frontend development origin through its CORS configuration.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` checks JavaScript and JSX, including accessibility rules.
- `npm run format` formats supported files with Prettier.
- `npm run format:check` verifies formatting without changing files.
- `npm run test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run test:coverage` generates text and HTML coverage reports.
- `npm run test:e2e` starts Vite and runs the Playwright smoke suite.

The Playwright project uses the locally installed stable Chrome channel. CI agents must provide Google Chrome or adapt the Playwright project to a managed browser binary.

## Architecture

Application code follows a feature-sliced structure:

```text
src/
  app/          application providers, query client, and theme
  components/   shared layout and UI components
  constants/    route and wire-value constants
  context/      cross-feature React contexts
  features/     feature-owned UI, services, hooks, and tests
  hooks/        reusable cross-feature hooks
  routes/       route definitions and future auth guards
  services/     shared HTTP transport and error normalization
  styles/       Tailwind entry point and global styles
  test/         shared test setup
  types/        JSDoc API contracts
  utils/        pure presentation and formatting utilities
```

Folders are added only when the first implementation needs them. Each feature owns its API adapter, query keys/hooks, components, validation, and tests and exposes a small public `index.js` API.

## Styling

- MUI owns accessible complex controls such as dialogs, menus, and form widgets.
- Tailwind owns layout, spacing, responsive composition, and typography.
- Semantic design tokens are declared in `src/styles/global.css` and mirrored where necessary by the MUI theme.
- Custom CSS is reserved for global rules and specialized timeline/Gantt rendering.

Avoid styling the same property through both MUI and Tailwind. The application remains mobile-first and must preserve visible keyboard focus and WCAG AA contrast.

## Data and authentication boundaries

TanStack Query owns server state and Axios owns HTTP transport. The authentication feature posts credentials to `/users/login`, keeps access tokens in memory, persists refresh tokens in local storage, and restores sessions through `/auth/refresh`. Authenticated requests receive bearer tokens through the shared API client, and protected routes wait for restoration before rendering.

Refresh rotation is serialized within a tab and across tabs. Login and refresh use a separate transport so authentication failures cannot create recursive renewal requests. Signing out clears credentials and user-scoped query data in every listening tab.

The frontend requirements and contribution rules live under `.agents/`; read `.agents/AGENTS.md` before modifying screens, services, state, or hooks.
