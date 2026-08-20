# Smart Student Diet Planner

A responsive nutrition tracker for students. Users create a profile, receive a calorie estimate, and log meals for the current day. The frontend is built with vanilla JavaScript and Vite; the API uses Express and PostgreSQL.

## Features

- Profile-based calorie estimate using age, height, weight, activity level, and goal
- BMI category and daily calorie progress
- Budget- and goal-aware meal recommendations with one-click meal logging
- Seven-day calories-versus-target history chart
- Per-browser anonymous user identifier to prevent demo users from sharing a log
- Safe food-log rendering, API validation, rate limiting, CORS restriction, and security headers
- PostgreSQL schema and automated validation tests

> Calorie and BMI information is an estimate only, not medical advice.

## Local setup

Prerequisites: Node.js 20+ and PostgreSQL 15+.

1. Create a database named `smart_diet_planner`.
2. Run the schema:

   ```bash
   psql smart_diet_planner < backend/migrations/001_initial_schema.sql
   ```

3. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
4. Copy `.env.example` to `.env`.
5. Install and run the API:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

6. In a second terminal, install and run the frontend:

   ```bash
   npm install
   npm run dev
   ```

Open the Vite URL displayed in the terminal, normally `http://localhost:5173`. Do not open `index.html` directly: it needs the frontend and API servers running.

## Tests

```bash
cd backend
npm test
```

## Deployment

### Render API and PostgreSQL

1. Push this project to GitHub, then create a Render Blueprint from `render.yaml` (or create the database and web service manually).
2. Set `FRONTEND_URL` to the final Vercel URL, for example `https://smart-student-diet-planner.vercel.app`.
3. Run `backend/migrations/001_initial_schema.sql` against the Render PostgreSQL database once.
4. Verify `https://your-render-service.onrender.com/health` returns `{ "success": true, "status": "ok" }`.

### Vercel frontend

1. Import the same GitHub repository into Vercel.
2. Set the environment variable `VITE_API_BASE_URL` to your Render API URL, such as `https://smart-student-diet-api.onrender.com`.
3. Deploy. Vercel uses `npm run build` and serves `dist/`.
4. Update Render's `FRONTEND_URL` if Vercel gives the site a different final domain, then redeploy Render.

## GitHub checklist

- Never commit `.env`, database URLs, or credentials.
- Keep `package-lock.json` files committed, but never commit `node_modules/` or `.DS_Store`.
- Add screenshots, the deployed Vercel URL, the Render API health URL, and this architecture to your GitHub README.
- This project uses anonymous browser IDs for an unauthenticated portfolio demo. Add real authentication before collecting personal data from real users.

## Resume description

Built and deployed a full-stack student nutrition tracker using JavaScript, Vite, Express, and PostgreSQL; implemented profile-based calorie estimates, daily meal logging, REST APIs, input validation, CORS/security controls, and automated tests.
