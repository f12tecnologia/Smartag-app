# Dashboard QRCode

## Overview
A React-based dashboard application for QR code management with authentication, built using Vite, TailwindCSS, and Supabase.

## Project Architecture
- **Frontend**: React 18 with Vite bundler
- **Styling**: TailwindCSS with Radix UI components
- **Backend/Auth**: Supabase (external service)
- **Routing**: React Router v6

## Key Directories
- `src/` - Main application source code
  - `components/` - UI components
  - `pages/` - Page components
  - `contexts/` - React context providers
  - `lib/` - Utility libraries
- `plugins/` - Vite plugins for development
- `tools/` - Build tools

## Development
- Run `npm run dev` to start the development server on port 5000
- The app uses Vite with hot module replacement

## Deployment
- Build with `npm run build`
- Static files are output to `dist/` directory

## Dependencies
- Uses Supabase for authentication and backend services
- Uses Recharts for data visualization
- Uses @react-pdf/renderer for PDF generation
- Uses qrcode for QR code generation
