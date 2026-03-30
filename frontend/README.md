# RBAC System - Frontend

This directory contains the React (Vite) frontend application for the Role-Based Access Control system.

## Setup
```bash
npm install
npm run dev
```

## Structure
- `src/components/`: Reusable, generic UI components (Sidebar, Navbar, Table, Modal, Badge).
- `src/pages/`: Specific routes rendering the main views (Dashboard, Users, Roles, Permissions, Login).
- `src/context/`: Contains the globally provided `AuthContext` to manage local JSON Web Tokens.
- `src/api/`: Includes a centralized `axios` configuration which automatically binds tokens to outgoing requests.

## UI Styling (Custom CSS)
The frontend uses handcrafted CSS for all UI layouts using a blue/slate color palette. Variables are strictly implemented inside `index.css`. We use `@mui/icons-material` strictly for iconography.

Please refer to the main [README.md](../README.md) in the root of the project for full architecture details, credentials, and full-stack setup instructions.
