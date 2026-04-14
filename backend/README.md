# GMS Backend - Dual Architecture

This backend supports **two architectures**:

## 1. Lambda Architecture (Cloud Deployment)
- **Entry Point**: `local-server.js`
- **Structure**: `Lambda/` folder with serverless functions
- **Run**: `npm run dev`
- **Purpose**: AWS Lambda deployment, serverless architecture

## 2. MVC Architecture (Local Development)
- **Entry Point**: `server.js`
- **Structure**: `src/` folder with controllers, routes, middlewares
- **Run**: `npm run dev:mvc`
- **Purpose**: Traditional Express.js MVC pattern for local development

---

## MVC Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   │   ├── db.js
│   │   └── roles.js
│   ├── controllers/     # Business logic
│   │   ├── auth.controller.js
│   │   ├── complaint.controller.js
│   │   ├── admin.controller.js
│   │   └── officer.controller.js
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.js
│   │   ├── complaint.routes.js
│   │   ├── admin.routes.js
│   │   └── officer.routes.js
│   ├── middlewares/     # Auth, validation, error handling
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   └── app.js           # Express app setup
├── Shared/              # Shared models & utilities
│   ├── models.js
│   ├── db.js
│   └── jwt.js
├── Lambda/              # Serverless functions
└── server.js            # MVC entry point
```

---

## API Endpoints (MVC)

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Complaints (Citizen)
- `POST /api/complaints` - File a complaint
- `GET /api/complaints/my` - Get user's complaints

### Complaints (Officer)
- `GET /api/complaints/assigned` - Get assigned complaints
- `PATCH /api/complaints/:id/status` - Update complaint status

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add staff
- `GET /api/admin/complaints` - Get all complaints (with filters)

### Shared
- `GET /api/departments` - Get all departments
- `GET /api/categories` - Get categories (optional filter by departmentId)

---

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/gms
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

---

## Running the Servers

### Lambda Server (Default)
```bash
npm run dev
```
Server runs on `http://localhost:5000`

### MVC Server (New)
```bash
npm run dev:mvc
```
Server runs on `http://localhost:5001` (or PORT from .env)

---

## Notes

- Both servers use the **same MongoDB database**
- Both share the **same models** from `Shared/models.js`
- Lambda server is for **cloud deployment**
- MVC server is for **local development** with better structure
