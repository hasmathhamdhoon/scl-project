# Greenfield School Portal

The backend uses FastAPI, SQLAlchemy 2, and PostgreSQL. User passwords are
hashed with Argon2id. Login creates a revocable, expiring server-side session;
the browser receives only a random token in an HttpOnly cookie. There is no
public registration endpoint and no demo account.

## Local setup (Windows PowerShell)

1. Create a PostgreSQL database named `greenfield_school`.
2. From the repository root, install the backend and configure its connection:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   Copy-Item .env.example .env
   ```

3. Edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL username and
   password. URL-encode reserved characters in the password. Keep `.env`
   private; it is ignored by git.
4. Create the tables and the first administrator. The password is prompted
   without echo and only its Argon2id hash is stored:

   ```powershell
   py init_db.py
   py create_admin.py principal@greenfield.edu
   ```

   Use a unique password of 12–128 characters. Create additional accounts
   from the server console with a role, for example
   `py create_admin.py teacher1@greenfield.edu --role Teacher`. Reset a password
   with `py set_password.py teacher1@greenfield.edu`; this revokes that user's
   active sessions. Never enable public signup.
5. Start the API and frontend in separate terminals:

   ```powershell
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

   ```powershell
   cd ..
   npm run dev
   ```

   The Vite development server proxies `/api` requests to the backend.

Run the backend tests from the `backend` folder with
`py -m pip install -r requirements-dev.txt` and `py -m pytest`.

## Configuration

`backend/.env` supports:

- `DATABASE_URL`: PostgreSQL SQLAlchemy URL.
- `API_ORIGINS`: comma-separated, exact browser origins allowed by CORS and
  cookie-authenticated write requests.
- `SESSION_COOKIE_SECURE`: set `true` behind HTTPS in production; the example
  sets it to `false` for local HTTP only.
- `SESSION_TTL_HOURS`: server-side session lifetime (default 8 hours).

Production must use HTTPS, set `SESSION_COOKIE_SECURE=true`, and replace
`API_ORIGINS` with the deployed frontend origin(s). Put the API behind a
reverse proxy with login rate limiting and TLS; do not expose the development
server or interactive API documentation publicly without an access policy.

## API currently implemented

- `GET /health`: verifies database connectivity.
- `POST /api/auth/login`: username and password sign-in.
- `GET /api/auth/me`: current authenticated account.
- `POST /api/auth/logout`: revokes the current server-side session.

Interactive API documentation is available at `/docs` when the API is running.

## Database notes

The ORM schema in `app/models.py` includes users, students, guardians, staff,
classes, attendance, gate events, leave requests, clubs, and assessments.
`init_db.py` creates missing tables; it does not alter existing columns. Back up
the database before schema changes and use a migration tool before changing
existing tables in a deployed database.

The current frontend still contains prototype school records and placeholder
actions outside authentication. Do not use it with real student data until
those screens are connected to authorized, database-backed API endpoints and
the demo records have been removed.
