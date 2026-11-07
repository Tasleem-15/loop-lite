# LOOP Lite 🔄 — AI Customer-Feedback Intelligence Platform

> **Simple, transparent full-stack customer feedback intelligence.**  
> Built strictly with **React.js (Vite)**, **Node.js (Express)**, **PostgreSQL (`pg` SQL)**, and **AI (Gemini)**.

---

## 🌟 What LOOP Lite Is

LOOP Lite is a lightweight, corporate-grade web application where a team gathers customer feedback across support tickets, app store reviews, NPS surveys, and sales notes. 

The integrated **AI automatically analyzes each feedback item**, tags its sentiment (`positive`, `neutral`, or `negative`) with a confidence score, and visualizes trends through an executive dashboard and paginated feedback inbox.

---

## 🛠️ The Tech Stack (No Bloat)

| Layer | Tool | Why |
|---|---|---|
| **Language** | JavaScript (ES6+) | Unified language across both frontend and backend |
| **Frontend** | React 18 + Vite | Modern, blazing-fast UI with zero unnecessary bundle bloat |
| **Styling** | Clean Modern CSS | Sleek, dark SaaS dashboard interface (responsive on all screens) |
| **Backend** | Node.js + Express | Clear REST API endpoints, simple and transparent |
| **Database** | PostgreSQL (Neon.tech / local) | Industry-standard relational SQL database |
| **SQL Driver** | `pg` (node-postgres) | Direct, plain SQL parameterized queries without ORM magic |
| **Auth** | JWT + bcryptjs | Secure password hashing and token-based role authentication |
| **AI** | Google Gemini API (Free key) | Automatic sentiment analysis and scoring |
| **Charts** | Recharts | Interactive sentiment distribution and channel breakdown charts |

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with two accounts for instant testing:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@loop.com` | `admin123` | Full access: ingest feedback, update status, delete items |
| **Viewer** | `viewer@loop.com` | `viewer123` | Read-only access: view dashboard, explore inbox, search & filter |

*(You can also register a new account on the login page at any time).*

---

## 🗄️ Database Schema

The database consists of two clean, related tables:

```sql
-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Feedback Table
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  channel TEXT,
  sentiment TEXT,
  sentiment_score REAL,
  status TEXT DEFAULT 'new',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile from JWT | Logged-in |
| `GET` | `/api/feedback` | List feedback (supports `?search=`, `?sentiment=`, `?status=`) | Logged-in |
| `POST` | `/api/feedback` | Ingest feedback text (AI automatically tags sentiment) | Admin |
| `PATCH` | `/api/feedback/:id/status` | Update workflow status (`new`, `reviewed`, `actioned`) | Admin |
| `DELETE` | `/api/feedback/:id` | Delete feedback item | Admin |
| `GET` | `/api/stats` | Aggregated metrics for dashboard cards and charts | Logged-in |

---

## 🚀 Quick Setup & Run Instructions

### 1. Prerequisites
- **Node.js**: v18+ or v20+ installed
- A PostgreSQL database (e.g., free [Neon.tech](https://neon.tech) cloud database)

### 2. Backend Setup
```bash
cd server
npm install
```

Configure your `server/.env` file:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key   # Optional: Get free key from https://aistudio.google.com/
```

Initialize and seed the database:
```bash
npm run db:seed
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Or Use One-Click Launcher (Windows)
Double-click `start-dev.bat` from the root `loop-lite/` directory.

---

## 🤖 AI Sentiment Logic (`server/ai.js`)

When an Admin submits feedback:
1. The server calls the **Google Gemini API** (`gemini-1.5-flash`) with a strict JSON system prompt.
2. Gemini returns:
   - `sentiment`: `'positive'`, `'neutral'`, or `'negative'`
   - `sentiment_score`: float from `-1.0` to `1.0`
3. The server validates and saves this record into PostgreSQL.
4. *Built-in Resilience:* If no `GEMINI_API_KEY` is supplied, an intelligent heuristic classifier handles sentiment scoring automatically so the application remains 100% functional out-of-the-box.
