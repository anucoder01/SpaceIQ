# SpaceIQ

SpaceIQ is a modern, full-stack web application featuring a dynamic React frontend and a robust Express/MongoDB backend. It provides interactive Dashboard and Analytics views designed with modern aesthetics.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Routing:** React Router v7
- **Icons & Utilities:** Lucide React, clsx, tailwind-merge

### Backend
- **Server:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Security & Utils:** bcrypt, CORS, dotenv

## 📁 Project Structure

```
SpaceIQ/
├── backend/               # Express server and API routes
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── server.js          # Express entry point
│   └── package.json
└── frontend/              # React frontend application
    ├── public/            # Static assets
    ├── src/               # React components and pages
    │   ├── App.jsx        # Main application component
    │   ├── pages/         # Dashboard and Analytics pages
    │   └── ...
    ├── index.html
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (optional, uses default values if not provided):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/spaceiq
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *(Assuming start script is configured, or run `node server.js`)*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:5173` (or the port specified by Vite) to view the application.

## 📝 License

This project includes a proprietary license. See the `LICENSE` file for details.
