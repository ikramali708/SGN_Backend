# SGN Admin Panel (React + Vite)

Admin UI for the SGN backend: login, JWT in `localStorage`, protected routes, and pages wired to `/api/admin/*`.

## Prerequisites

- Node.js 18+ (recommended 20+)
- Backend running (default `http://localhost:5285` with the `http` launch profile)

## Install & run (local)

```bash
cd SGN-Admin-UI
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to `http://localhost:5285`, so you usually do **not** need `VITE_API_URL` for local development.

### Login

- The UI posts to **`POST /api/admin/auth/login`** with JSON `{ "email", "password" }` (your backend route; not `/api/auth/login`).
- After login, the JWT is stored as **`sgn_admin_token`** and the app checks for an **Admin** role in the token before allowing `/admin/*`.

### Production / custom API URL

Build with a full API base URL (CORS must allow your site origin; the backend includes `http://localhost:5173` for dev):

```bash
# .env.production
VITE_API_URL=https://your-api-host.com
npm run build
npm run preview
```

## Backend CORS

The ASP.NET app registers a CORS policy **`AdminUi`** for `http://localhost:5173` and `http://127.0.0.1:5173`. For other origins, extend `Program.cs` or use only the Vite proxy in dev.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Vite dev server          |
| `npm run build`| Production build → `dist`|
| `npm run preview` | Serve production build |

## API mapping

| Page        | Endpoint |
| ----------- | -------- |
| Login       | `POST /api/admin/auth/login` |
| Dashboard   | `GET /api/admin/dashboard/stats` |
| Users       | `GET /api/admin/users` |
| Nurseries   | `GET /api/admin/nurseries`, `PUT .../approve`, `PUT .../reject` |
| Plants      | `GET /api/admin/plants` |
| Orders      | `GET /api/admin/orders` |
| Categories  | `GET /api/admin/categories` |
| Reports     | `GET /api/admin/reports` + dashboard stats for nursery count |

Some actions (delete plant, patch order status, POST category) may return **404/405** until matching endpoints exist on the API; the UI handles that with a clear message.
