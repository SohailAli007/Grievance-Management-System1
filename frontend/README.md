# Frontend - Serverless Grievance Management System

## Overview
React frontend for the Grievance Management System built with Vite, React Router, and Tailwind CSS.

## Prerequisites
- Node.js 18+
- npm or yarn

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and automatically proxy API requests to the backend on `http://localhost:4000`.

## Build
```bash
npm run build
```

## Preview
```bash
npm run preview
```

## Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:4000
```

If not provided, the app will use `/api` which proxies to the backend during development.

## Default Login Credentials
- **Citizen:** citizen@demo.com / password
- **Officer:** officer@demo.com / password  
- **Admin:** admin@demo.com / password

## Features
- User authentication (login/register)
- Role-based access control (Citizen, Officer, Admin)
- Complaint filing and tracking
- Real-time updates with Server-Sent Events
- Responsive design with Tailwind CSS

## Project Structure
```
src/
├── api/           # API client functions
├── components/    # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
│   ├── auth/      # Authentication pages
│   ├── citizen/   # Citizen-specific pages
│   ├── officer/   # Officer-specific pages
│   └── admin/     # Admin-specific pages
├── routes/        # Route protection logic
└── main.jsx       # App entry point
```
