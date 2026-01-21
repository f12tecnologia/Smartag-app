# Dashboard QRCode

## Overview
A React-based dashboard application for QR code management with authentication, using a custom Express backend connected to an external PostgreSQL database.

## Project Architecture
- **Frontend**: React 18 with Vite bundler (port 5000)
- **Backend**: Express.js API (port 3001)
- **Database**: External PostgreSQL via EXTERNAL_DATABASE_URL
- **Styling**: TailwindCSS with Radix UI components
- **Authentication**: JWT-based with bcrypt password hashing
- **Routing**: React Router v6

## Key Directories
- `src/` - Frontend React application
  - `components/` - UI components
  - `pages/` - Page components
  - `contexts/` - React context providers (AuthContext)
  - `lib/` - API client and utilities
- `server/` - Backend Express server
  - `routes/` - API routes (auth, qrCodes, profile, users)
  - `middleware/` - JWT authentication middleware
  - `db.js` - PostgreSQL connection with auto-initialization

## Database
- Uses external PostgreSQL database via EXTERNAL_DATABASE_URL
- Auto-initializes schema on startup (users, profiles, qr_codes tables)
- Pre-seeds 20 QR codes from original CSV data if table is empty
- Works with existing database schemas (handles UUID/VARCHAR id mismatches)

## Environment Variables
- `EXTERNAL_DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - JWT signing secret

## Development
- Run `npm run dev` to start both backend and frontend
- Frontend: http://localhost:5000
- Backend API: http://localhost:3001/api

## API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Verify session
- `GET /api/qr-codes` - List QR codes
- `POST /api/qr-codes` - Create QR code
- `DELETE /api/qr-codes/:id` - Delete QR code
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/users` - List users (admin only)

## User Preferences
- Portuguese language interface
- Dark theme UI

## Recent Changes (Jan 2026)
- Added auto-initialization of database schema on startup
- Fixed profile route to handle UUID/VARCHAR id type mismatches
- Pre-seeds 20 QR codes from CSV data on first run
