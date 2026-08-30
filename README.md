# Debt Collection Case Management System

A full-stack, role-based case management system for tracking debt collection workflows between **Managers**, **Debt Collection Agents (DCAs)**, and **Customers**.

---

## Overview

This project digitizes the debt-collection lifecycle end-to-end:

- **Managers** create debt cases, assign them to a DCA, and set a due date based on the debt amount (SLA-style tracking).
- **DCAs** view cases assigned to them and update case status (e.g. *In Progress*, *Collected*).
- **Customers** view their own case, upload payment proof (a screenshot or receipt), and track resolution.
- **Managers** review submitted payment proof and approve completed cases.

Each role has its own dedicated dashboard, with authentication and authorization handled via JWT.

---

## Tech Stack

**Frontend**
- HTML5, CSS3 (Tailwind CSS)
- Vanilla JavaScript (`fetch` API, no framework)

**Backend**
- Node.js
- Express.js — REST API framework
- MongoDB (via Mongoose ODM)

**Authentication & Security**
- JWT (JSON Web Tokens) — stateless authentication
- bcrypt — salted password hashing
- Multer — multipart file upload handling (payment proof)
- CORS — cross-origin request handling

---

## Why This Stack?

| Choice | Reason |
|---|---|
| **Node.js + Express** | JavaScript across both frontend and backend, minimal boilerplate for a small, well-defined REST API surface (auth + case CRUD). |
| **MongoDB** | Case data is naturally document-shaped — each case has a nested, variable-length `history` array (status change log). This fits a document model far more cleanly than a relational schema requiring joined tables. |
| **JWT** | Enables stateless authentication — no server-side session store needed, and the token carries role information so each dashboard can route access appropriately. |
| **bcrypt** | Industry-standard adaptive password hashing; salting defeats rainbow-table attacks, and its tunable cost factor defends against brute-force attempts. |
| **Multer** | Express doesn't parse `multipart/form-data` natively; Multer is the standard middleware for handling file uploads like payment proof images. |

---

## Features

- Role-based dashboards for Manager / DCA / Customer
- JWT-based stateless authentication
- Secure password storage with bcrypt (salt + hashing)
- Case creation, assignment, and status tracking
- Payment proof upload (image) per case
- Case approval workflow
- Full case history log per case

---

## Project Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection setup
├── middleware/
│   └── auth.js             # JWT verification middleware
├── models/
│   ├── User.js              # User schema (username, password, role)
│   └── Case.js              # Case schema (customer, DCA, status, history, proof)
├── routes/
│   ├── auth.js              # /register, /login
│   └── case.js              # Case CRUD + payment proof upload
├── uploads/
│   └── payment-proofs/      # Uploaded proof images
├── server.js                # Express app entry point
└── .env                      # Environment variables (DB URI, JWT secret)

src/
├── js/
│   ├── auth.js               # Login/register logic
│   ├── manager.js            # Manager dashboard logic
│   ├── dca.js                 # DCA dashboard logic
│   └── customer.js            # Customer dashboard logic
└── (HTML/CSS pages per role)
```

---

## Authentication Flow

1. User registers → password is hashed with bcrypt (`bcrypt.hash(password, 10)`) → stored in MongoDB.
2. User logs in → password verified with `bcrypt.compare()` → server issues a JWT containing `{ id, role }`, signed with a server-side secret, valid for 1 day.
3. Client stores the token and attaches it as `Authorization: Bearer <token>` on every request.
4. Server middleware verifies the token's signature on each protected route before granting access.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/cases` | Fetch all cases |
| POST | `/api/cases` | Create a new case (Manager) |
| PUT | `/api/cases/:id` | Update case status/approval |
| DELETE | `/api/cases/:id` | Delete a case |
| POST | `/api/cases/:id/upload-proof` | Upload payment proof image |

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with:
# MONGO_URI=<your-mongodb-connection-string>
# JWT_SECRET=<your-secret-key>
# PORT=5000

# Start the server
node server.js
```

Open the frontend HTML pages (`login.html`, `manager.html`, `dca.html`, `customer.html`) in a browser, or serve `src/` via a static server.

---

## Known Limitations / Roadmap

This project is a working prototype; a few areas are intentionally flagged for future hardening:

- [ ] **Server-side role authorization** — currently, authentication middleware verifies a valid JWT but does not restrict routes by role. Adding a `requireRole()` middleware is planned.
- [ ] **Environment secrets** — ensure `.env` is excluded via `.gitignore` in any deployment; rotate credentials if previously exposed.
- [ ] **Server-side pagination/filtering** for case retrieval instead of client-side filtering.
- [ ] **Stricter file validation** on upload (beyond MIME-type checks).
- [ ] **Token revocation strategy** (e.g. refresh tokens or a blocklist) for real logout support.

---

## License

This project was built as an academic/portfolio project.
