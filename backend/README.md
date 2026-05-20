# 🥗 Vitality Health Dashboard - Backend

This is a lightweight, beginner-friendly **Node.js** and **Express.js** backend server built to support your **Vitality Health Dashboard** website. 

It provides clean APIs for managing user profiles and logging daily food items, storing all data dynamically in-memory (no database setup required!).

---

## 📂 Project Structure

```text
backend/
├── package.json               # Node.js dependencies & run scripts
├── server.js                  # Entry point, initializes Express & CORS
├── routes/
│   ├── profileRoutes.js       # Routes for user profiles
│   └── foodLogRoutes.js       # Routes for food tracking
└── controllers/
    ├── profileController.js   # Handles business logic for profiles
    └── foodLogController.js   # Handles food logging & calories
```

---

## ⚡ How to Set Up and Run

Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 1. Install Dependencies
Open your terminal, navigate (`cd`) into the `backend/` folder, and run:
```bash
npm install
```
This will automatically read the `package.json` and install:
* **express**: The web framework for handling API requests.
* **cors**: Middleware allowing secure requests between your frontend and backend.
* **nodemon** (Dev Dependency): Automatically restarts the server whenever you edit files.

### 2. Start the Server
For development (with auto-restart on changes):
```bash
npm run dev
```
For production:
```bash
npm start
```
You will see a message:
`Vitality Health Backend is running on port 5001`

---

## 🌐 API Reference

All requests should be sent to the base URL: **`http://localhost:5001`**

| Endpoint | Method | Description | Request Body Example |
|---|---|---|---|
| `/api/profile` | **GET** | Retrieve saved user profile | *None* |
| `/api/profile` | **POST** | Save/update user profile details | See [Profile POST](#1-save-profile-post-apiprofile) |
| `/api/food-log` | **GET** | Retrieve all food items & calorie total | *None* |
| `/api/food-log` | **POST** | Add a new food item | See [Food Log POST](#3-add-food-item-post-apifood-log) |
| `/api/food-log/:id` | **DELETE** | Delete a specific food item by its ID | *None* |
| `/api/food-log` | **DELETE** | Clear all food items for today | *None* |

---

## 🔗 Connecting Your Frontend using `fetch()`

Here is how you can write `fetch()` calls in your frontend script to talk to the backend APIs:

### 1. Save Profile (`POST /api/profile`)
Call this when the user submits their profile form:
```javascript
const userData = {
  name: "Jane Doe",
  age: 20,
  weight: 65.5,
  height: 170,
  goal: "loss",
  budget: "low"
};

fetch('http://localhost:5001/api/profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' // Essential for Express to parse JSON
  },
  body: JSON.stringify(userData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log("Profile saved on backend:", data.data);
    // Update your UI here
  } else {
    console.error("Error saving profile:", data.message);
  }
})
.catch(error => console.error("Network Error:", error));
```

### 2. Retrieve Profile (`GET /api/profile`)
Call this when the application starts up:
```javascript
fetch('http://localhost:5001/api/profile')
.then(response => response.json())
.then(result => {
  if (result.success && result.data) {
    console.log("Loaded profile:", result.data);
    // Fill your form inputs and update headers
  } else {
    console.log("No profile on server yet.");
  }
})
.catch(error => console.error("Error loading profile:", error));
```

### 3. Add Food Item (`POST /api/food-log`)
Call this when adding a food item or quick logging:
```javascript
fetch('http://localhost:5001/api/food-log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Apple",
    calories: 95
  })
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log("Food added:", result.data);
    console.log("New Total Calories:", result.totalCalories);
    // Re-render food log on your UI
  }
})
.catch(error => console.error("Error adding food:", error));
```

### 4. Fetch Food Log & Calories (`GET /api/food-log`)
Call this to get all food logs and automatically retrieve the calorie sum calculated on the backend:
```javascript
fetch('http://localhost:5001/api/food-log')
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log("Total calories consumed:", result.totalCalories);
    console.log("Food items list:", result.data);
    // Render list elements and update calorie goal displays
  }
})
.catch(error => console.error("Error fetching food logs:", error));
```

### 5. Remove Single Food Item (`DELETE /api/food-log/:id`)
Call this when a user clicks the remove (`&times;`) button next to a logged item:
```javascript
function removeFoodItem(id) {
  fetch(`http://localhost:5001/api/food-log/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log(result.message);
      console.log("New Total Calories:", result.totalCalories);
      // Re-render the food logs on screen
    }
  })
  .catch(error => console.error("Error deleting food item:", error));
}
```

### 6. Clear Entire Log (`DELETE /api/food-log`)
Call this when the "Clear" button is clicked:
```javascript
fetch('http://localhost:5001/api/food-log', {
  method: 'DELETE'
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log("All logs cleared.");
    // Clear list display on UI and reset total to 0
  }
})
.catch(error => console.error("Error clearing logs:", error));
```

---

## 💡 Beginner-Friendly Tips

1. **In-Memory Storage Reset**: Because we store the data in standard JavaScript arrays/objects on the server, the data will **reset** whenever you restart the backend server. To keep data permanently, you can replace the in-memory variables in controllers with databases (like MongoDB, SQLite, or PostgreSQL) or local files later.
2. **CORS is Active**: In `server.js`, `app.use(cors())` is included. Without this, your browser would block frontend requests because they are originating from a different origin (e.g., your local files or a local server running on a different port) than the backend on port `5001`.
3. **Always Send Headers**: For any `POST` requests, remember to include `'Content-Type': 'application/json'` in the headers, or `express.json()` will not be able to parse your request body (`req.body` will be empty!).
