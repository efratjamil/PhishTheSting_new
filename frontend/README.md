# PhishTheSting Frontend

The React frontend for PhishTheSting, a phishing detection application. It allows users to analyze messages and links, view results, and manage their scan history.

## Setup

Requirements: Node.js 18+ and the backend server running.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

To use a different backend URL, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Scripts

- `npm run dev`: start the development server
- `npm run build`: create a production build
- `npm run lint`: run ESLint
- `npm run preview`: preview the production build

## Main Technologies

React, Vite, React Router, Axios, Tailwind CSS, and Framer Motion.
