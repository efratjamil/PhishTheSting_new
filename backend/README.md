# PhishTheSting Backend

The Node.js API for PhishTheSting. It provides authentication, phishing analysis, URL safety checks, scan history, and AI-generated explanations.

## Setup

Requirements: Node.js 18+ and MongoDB.

```bash
npm install
```

Copy `.env.example` to `.env`, then provide the required values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/phishingDB
JWT_SECRET=your-long-random-secret
FRONTEND_URL=http://localhost:5173
GOOGLE_SAFE_BROWSING_KEY=your-key
GEMINI_API_KEY=your-key
```

Optional Bitly and SMTP settings are documented in `.env.example`. Never commit the `.env` file.

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:5000/api` by default.

## Scripts

- `npm run dev`: start the server
- `npm start`: start the server
- `npm test`: run the brand detector test

## Main Technologies

Express, MongoDB, Mongoose, JWT, Zod, Gemini, and Google Safe Browsing.
