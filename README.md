# 🏥 Sacred Heart Hospital Management System (HMS)

A clean, modern, and professional healthcare web application designed to manage patients, doctors, appointments, medical records, and admin report analytics.

Featuring **clinical aesthetics, dark/light theme options, responsive mobile-first layouts (collapsible hamburger sidebars), and a dual-mode API pipeline**.

---

## ⚡ The Dual-Mode Architecture

To provide an immediate interactive experience without database configurations, the frontend is engineered with an **automatic mock database fallback**:
1. **Live Mode:** Connects to the Express API backend (`/api`) and queries PostgreSQL.
2. **Mock Mode (Default when offline):** If the client detects that the backend is unreachable, it logs a warning in the console and switches seamlessly to a stateful `localStorage` database.

You can register new patients, book appointments, check doctor schedules, manage EMR diagnoses, write prescriptions, and inspect charts. All state modifications persist across browser refreshes!

---

## 🔑 Demo Autofill Credentials (Mock & Seeding)

We have pre-seeded the application with test accounts for immediate evaluation. You can use the autofill shortcuts on the login screen or enter manually:

| Role | Username | Password | Actions / Access |
|---|---|---|---|
| **Administrator** | `admin@hospital.com` | `admin123` | Global doctor/patient/department CRUD, system reports charts. |
| **Doctor** | `doctor@hospital.com` | `doctor123` | View timeline schedule, accept/reject bookings, log diagnoses, write prescriptions. |
| **Patient** | `patient@hospital.com` | `patient123` | Book appointments (slot collision checks), view medical history, download prescriptions. |

---

## 📂 Project Structure

```
d:\Hospital
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── assets/               # CSS fonts & variables
│   │   ├── components/           # Navbar, Sidebar, Footer layout wrappers
│   │   ├── pages/                # Public (Home/Doctors), Auth, and Dashboard panels
│   │   ├── services/             # api.js bridge + mockDb.js local database
│   │   ├── context/              # Auth & Toast notifications providers
│   │   ├── App.jsx               # Router & Layout drivers
│   │   ├── index.css             # Vanilla HSL CSS design tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Express API Server (Node)
│   ├── config/
│   │   ├── db.js                 # PostgreSQL pg connection pool
│   │   └── schema.sql            # Table structures & role seeds
│   ├── controllers/              # EMR, Auth, Appointments logic
│   ├── middleware/               # JWT validation & Role guards
│   ├── routes/                   # Router mounts
│   ├── utils/                    # generatePDF.js (pdfkit)
│   ├── server.js                 # App server entry
│   └── package.json
│
├── .env.example                  # Environment key templates
├── .env                          # Populated development values
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+) & npm
- PostgreSQL (optional, if running Live mode)

---

### Setup Option A: Standalone Mock Mode (Fastest)

To run the React app entirely in the browser with local storage state:

1. Enter client folder:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Run Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (typically `http://localhost:3000`).

---

### Setup Option B: Live Server Mode (Full Stack)

To run with Node.js and PostgreSQL:

1. **Database Setup:**
   Ensure PostgreSQL is running. Create a database and execute the schema:
   ```bash
   psql -U postgres -c "CREATE DATABASE hms_db"
   psql -U postgres -d hms_db -f server/config/schema.sql
   ```

2. **Configure Environment Variables:**
   A development `.env` has been generated for you in the root. Verify the parameters:
   - `DATABASE_URL`: Set connection parameters `postgresql://<user>:<password>@localhost:5432/hms_db`.
   - `JWT_SECRET`: Standard secret key.

3. **Run API Server:**
   ```bash
   cd server
   npm install
   npm start
   ```
   You should see: `🏥 HMS Backend API Server running on port 5000`.

4. **Run Frontend Client:**
   Open a separate terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`. The client proxy will route all requests to port 5000.
