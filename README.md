# Todo with Blocking

## Overview

This repository contains a todo application with a Flask backend and a React + Vite frontend.

- Backend: Python + Flask + SQLAlchemy + Alembic
- Frontend: React + Vite + Tailwind CSS

The backend stores todo tasks scoped by client IP and supports create/read/update/delete operations plus completion toggling.

---

## Backend

### Location

- Root backend files: `run.py`, `requirements.txt`
- Application code: `src/app`
- Migrations: `alembic/`

### Tech stack

- Flask
- Flask-CORS
- SQLAlchemy
- PyMySQL
- Alembic
- python-dotenv

### Requirements

Install Python dependencies from the project root:

```powershell
cd c:\Users\pc\OneDrive\Desktop\backend_projects\Todo-with-blocking
venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

> `requirements.txt` includes:
> - `Flask==3.0.3`
> - `flask-cors==6.0.2`
> - `SQLAlchemy==2.0.49`
> - `PyMySQL==1.1.1`
> - `alembic==1.13.2`
> - `python-dotenv==1.0.1`

### Configuration

The backend reads environment variables from the system or `.env` file.

Required:

- `DATABASE_URL` — SQLAlchemy database connection string

Optional:

- `HOST` — host address for Flask (e.g. `0.0.0.0`)
- `PORT` — port for Flask (recommended `5001` to match the frontend default)
- `FLASK_DEBUG` — set to `true` to enable debug mode

Example `.env` values:

```text
DATABASE_URL=mysql+pymysql://todouser:todopassword@localhost:3306/todo
HOST=0.0.0.0
PORT=5001
FLASK_DEBUG=true
```

### Run backend

```powershell
venv\Scripts\Activate.ps1
python run.py
```

If `PORT` is not set, Flask will use its default port (usually `5000`). The frontend is configured to use `http://localhost:5001` unless `VITE_API_BASE_URL` is changed.

### Database migrations

The repository includes Alembic migration support. To apply migrations:

```powershell
venv\Scripts\Activate.ps1
alembic upgrade head
```

The initial task table migration lives in `alembic/versions/20260420_0001_create_tasks_table.py`.

### API endpoints

The backend exposes a todo API under the `/api/v1` base path.

- `GET /api/v1/todos?date=YYYY-MM-DD` — list tasks for the current client IP and selected date
- `POST /api/v1/todos` — create a new todo
- `PATCH /api/v1/todos/<id>/complete` — mark a todo complete
- `PATCH /api/v1/todos/<id>` — update a todo
- `DELETE /api/v1/todos/<id>` — delete a todo

### Notes

- Todos are stored in the `tasks` table.
- Task visibility is scoped by client IP address.
- The backend validates payload fields and returns JSON error responses.

---

## Frontend

### Location

- Frontend root: `src/app/UI`
- React app entry: `src/app/UI/src/main.jsx`
- API wrapper: `src/app/UI/src/services/api.js`
- Todo hooks: `src/app/UI/src/hooks/useTodos.js`

### Tech stack

- React
- Vite
- Tailwind CSS
- Axios
- date-fns
- lucide-react

### Install dependencies

```powershell
cd src/app/UI
npm install
```

### Run frontend

```powershell
cd src/app/UI
npm run dev
```

The Vite dev server defaults to port `5173`.

### Build frontend

```powershell
cd src/app/UI
npm run build
```

### Preview production build

```powershell
cd src/app/UI
npm run preview
```

### Frontend configuration

The frontend uses the environment variable `VITE_API_BASE_URL` to locate the backend API.

Default behavior:

- `VITE_API_BASE_URL` — `http://localhost:5001`

If your backend runs on a different host or port, set:

```text
VITE_API_BASE_URL=http://localhost:5000
```

### How the frontend works

- `useTodos` loads tasks for the selected date and manages optimistic updates.
- `api.js` calls backend endpoints via Axios.
- The app shows a calendar, task form, and task board in the UI.

---

## Development workflow

1. Start the backend
2. Start the frontend
3. Open the Vite app in the browser and use the UI

If the frontend cannot reach the backend, verify that:

- the backend is running
- `DATABASE_URL` is configured correctly
- `PORT` matches the frontend API URL or `VITE_API_BASE_URL` is updated

---

## Useful paths

- Backend app: `src/app`
- Backend routes: `src/app/api/v1/todos/controller.py`
- Backend business logic: `src/app/api/v1/todos/service.py`
- Backend validation/serialization: `src/app/api/v1/todos/schema.py`
- Frontend app: `src/app/UI`
- Frontend API client: `src/app/UI/src/services/api.js`
- Frontend state/hooks: `src/app/UI/src/hooks/useTodos.js`

