# 🚶‍♂️ Vitality Health Backend Walkthrough

We have successfully created a clean, modular, and beginner-friendly backend server for your **Vitality Health Dashboard** website using **Node.js** and **Express.js**.

To make your experience premium and effortless, the frontend (`index.html` and `script.js`) has been upgraded with **Dual-Mode Connectivity**:
1. **Live Server Mode**: Connects directly to your Express server when it is active, dynamically sending and receiving profile configurations, food logs, and calculated calorie totals.
2. **Local Storage Fallback**: If the Express server is offline, the frontend seamlessly falls back to standard browser `localStorage` without interrupting functionality.

A visual **Connection Status Badge** has been added to the header to show the active state!

---

## 🛠️ What We Did

### 1. Created the Modular Backend Structure
A new directory `backend/` was created to organize the backend code professionally:
- [backend/package.json](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/package.json): Lists Node.js configurations, startup scripts, and dependencies (`express`, `cors`, `nodemon`).
- [backend/server.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/server.js): Entry point that sets up CORS, parses JSON requests, routes endpoints, and starts the server on port `5001`.
- [backend/routes/profileRoutes.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/routes/profileRoutes.js): Connects the API endpoints (`GET /api/profile` and `POST /api/profile`) to the profile controller.
- [backend/routes/foodLogRoutes.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/routes/foodLogRoutes.js): Defines food tracking endpoints for adding, fetching, deleting, and clearing logs.
- [backend/controllers/profileController.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/controllers/profileController.js): Implements profile saving and retrieval with in-memory storage.
- [backend/controllers/foodLogController.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/controllers/foodLogController.js): Implements food logging CRUD operations and calorie aggregation.
- [backend/README.md](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/backend/README.md): Beginner-friendly documentation with detailed `fetch()` snippets.

### 2. Upgraded the Frontend UI & Styles
- [index.html](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/index.html): Injected a status badge `<span id="connectionBadge">` inside the top header.
- [styles.css](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/styles.css): Added premium-styled badges with active keyframe pulsing states (`.connection-badge.connected` & `.connection-badge.disconnected`).

### 3. Integrated Dynamic Fetch Calls
- [script.js](file:///Users/khushigupta/Desktop/Java%20code/Smart-Student-Diet-Planner/script.js):
  - Automatically queries the backend on startup to detect status.
  - Updates the UI connection status badge.
  - Synchronizes form submissions, food additions, item deletions, and log wipes with the server using standard asynchronous `fetch()` requests.

---

## ⚡ How to Start and Verify

### Step 1: Initialize the Server
We already ran `npm install` for you. To start the server, open your terminal inside the `backend/` folder and run:
```bash
npm run dev
```
You will see the console log:
`Vitality Health Backend is running on port 5001`

### Step 2: Open the Frontend
Open `index.html` in your browser. 
- If the Express server is running, the badge in the top-right header will say **`Live Server Mode`** with a pulsing green indicator. Any profiles saved or foods logged will live on the Express server in memory!
- If you stop the Express server, the badge immediately switches to **`Local Storage Mode`** with a red indicator, utilizing local caching safely.
