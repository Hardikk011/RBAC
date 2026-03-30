# Complete Role-Based Access Control (RBAC) System

A full-stack, production-quality RBAC system featuring a robust Django REST Framework backend and a highly responsive React (Vite) frontend. This system implements an advanced Many-to-Many access control model where Users have Roles, and Roles have precise granular Permissions.

## 🏛️ Architecture Overview

The system follows a classic decoupled client-server architecture:

### Backend (Django REST Framework)
- **Framework**: Django + DRF, serving structured JSON endpoints.
- **Database**: SQLite3 (for local development simplicity), completely ready to scale to PostgreSQL for production.
- **Authentication**: JWT (JSON Web Tokens) with a 1-hour expiration using `djangorestframework-simplejwt`.
- **Relational Model**:
  - `Permission`: Defines specific allowable actions (e.g., `delete_user`, `edit_role`).
  - `Role`: A group of permissions (e.g., `Admin`, `Viewer`).
  - `CustomUser`: Extends `AbstractUser`, allows many-to-many relationship mapping directly to Roles.
- **Permission Checking**: A custom recursive endpoint checks if a user is granted a permission by iterating over their assigned roles.

### Frontend (React + Vite)
- **Framework**: React 18, bundled using Vite for rapid builds and HMR.
- **Styling**: Handcrafted CSS leveraging a beautiful, modern CSS variable system. No component libraries (clean standard UI).
- **State Management**: React Context (`AuthContext`) manages the JWT authentication state globally.
- **API Client**: `axios` is configured with interceptors to automatically attach the JWT bearer token and seamlessly log the user out on 401 Unauthorized responses.
- **Icons**: Designed fully with `@mui/icons-material`.

---

## 🔑 Default Test Credentials

To help you get started immediately, a built-in `seed_data` command is provided to pre-seed the database. Running the command generates these users:

| Username | Password   | Role(s) | Typical Permissions |
|----------|------------|---------------|-------------------|
| `admin`  | `admin1234`| **Administrator** | Full system access (Superuser) |
| `hardik` | `hardik1234`| **Manager** | View Dash, Manage/Assign Users |
| `kunj`   | `kunj1234` | **Editor** + **Auditor** | View/Edit Users + Audit access (Combined) |
| `guest_user`| `guest1234` | **Standard User** | View Dashboard only |
| `restricted`| `restricted1234` | **None** | No access (Access Denied test case) |

> [!TIP]
> Use the **kunj** user to test permission inheritance from multiple roles, and **restricted** to verify that a user with no roles correctly sees "Access Denied."

---

## 🚀 Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python** (v3.9 or higher)
- **Node.js** (v18 or higher) and `npm`

### 2. Backend Setup
Open a terminal and set up the Django environment:

```bash
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install the dependencies
pip install -r requirements.txt

# Run migrations to create the database schema
python manage.py makemigrations
python manage.py migrate

# Seed the database with default Roles, Permissions, and Users
python manage.py seed_data

# Start the Django development server (runs on port 8000)
python manage.py runserver
```

### 3. Frontend Setup
Open a **new** terminal window and set up the React app:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

The application is now accessible at [http://localhost:5173](http://localhost:5173).

---

## 💡 Assumptions & Design Decisions

During development, several decisions were finalized to keep the system practical, understandable, and secure:

1. **Additive Permissions (Allow-by-default logic)**: If a user is assigned multiple roles, their permissions are merged dynamically. If **any** of their assigned roles grant the `delete_user` permission, they are fundamentally allowed to execute it.
2. **JWT Persistence**: For simplicity in this implementation, the backend issues JWT Access Tokens that the frontend stores directly in the browser's `localStorage`. (Note: In a high-security production environment, moving this to `HttpOnly` secure cookies is recommended).
3. **No Junction Models**: We utilized Django's built-in `models.ManyToManyField` without defining specific Junction tables (`through` models). Django creates these intermediate mapping tables automatically in the background, keeping our code clean and concise.
4. **Nested Writes via IDs**: When assigning roles or permissions through the REST API, we send simple arrays of IDs (`{"permission_ids": [1, 2]}`) rather than entire nested JSON objects. This restricts the logic cleanly to assignments rather than unintentional entity creation.
5. **UI & Theming**: The application purposefully avoids heavily bloated component libraries (like Bootstrap or Tailwind) and relies on pure, customized modern CSS. This ensures total predictability and makes styling highly extensible.

---

## 🛠 Features

- **Auth System**: Login, Logout, state persistence, and automatic 401 un-auth tracking.
- **Admin Dashboard**: Real-time aggregated statistics of total users, roles, and permissions in the system.
- **User Management**: Create users, delete users, and dynamically associate users to any roles via a custom modal interface.
- **Role Control**: Compose specific roles (like "Moderator" or "Viewer") out of granular permissions.
- **Permission CRUD**: View, create, edit, and delete base-level API permissions.
- **Live Permission Checker**: A built-in feature letting you test exactly which permissions a given user has resolved against their current role assignments.
