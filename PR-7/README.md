# Practical 7: Authentication and Middleware Pipeline

**Course / Code:** ITUE301 Advanced Web Frontend Frameworks  
**CO / PO:** CO2, CO6 / PO3, PO5  
**Objective:** To implement JWT-based authentication and input validation as part of the Express middleware pipeline in the Task Management application.

---

## 1. Architecture & Concept Diagram

```
POST /api/auth/register ──► Hash password (bcrypt) ──► Save User to MongoDB ──► 201 Created
POST /api/auth/login    ──► Verify password (bcrypt) ──► Sign JWT Token ──────► Return 200 OK + Token

Protected Task Route Flow:
Client Request (Header: Authorization: Bearer <JWT_Token>)
        │
        ▼
[ Auth Middleware ] ──► Verifies JWT signature ──► Decodes payload & attaches req.user
        │
        ▼
[ Input Validation Middleware ] ──► Validates payload fields & data types
        │
        ▼
[ Controller / DB Operation ] ──► Executes Task CRUD Operation & Returns JSON Response
```

---

## 2. Key Implementation Highlights

### A. User Schema with Bcrypt Password Hashing (`models/User.js`)
- Uses `bcryptjs` to hash passwords with salt rounds before saving to MongoDB.
- Excludes sensitive fields (password hash) when serializing user objects.

### B. JWT Authentication Middleware (`middleware/authMiddleware.js`)
- Intercepts requests on protected routes.
- Extracts `Bearer <token>` from the HTTP `Authorization` header.
- Verifies token validity using `jsonwebtoken` and `process.env.JWT_SECRET`.
- Attaches decoded user identity (`req.user`) to the request object.

### C. Server-Side Input Validation (`middleware/validateInput.js`)
- Checks incoming payloads for missing required fields (e.g. `title`).
- Sanitizes and validates data types before reaching database controller methods.

---

## 3. Required Screenshots Checklist for Practical 7 Report (`24DCS038.docx`)

1. **User Registration API Request (`POST /api/auth/register`)**:
   - Postman/Thunder Client screenshot showing request payload (name, email, password) and successful `201 Created` response.
2. **User Login API Request (`POST /api/auth/login`)**:
   - Postman/Thunder Client screenshot showing credentials and `200 OK` response with generated JWT token.
3. **MongoDB Compass User Collection**:
   - Screenshot of `users` collection showing stored user document with hashed bcrypt password (`$2a$10$...`).
4. **Protected Endpoint Without Token (`GET /api/tasks`)**:
   - Screenshot showing `401 Unauthorized` response when no token is provided.
5. **Protected Endpoint With Bearer Token (`GET /api/tasks`)**:
   - Screenshot showing `200 OK` response when `Authorization: Bearer <token>` is supplied.
6. **Frontend Auth UI & Protected Dashboard**:
   - Browser screenshot showing Login/Register form UI and token persistence in `localStorage`.

---

## 4. How to Run Practical 7

### Backend:
```bash
cd "Prac7/backend"
npm install
npm run dev
# Express server running on port 5000 with MongoDB connection
```

### Frontend:
```bash
cd "Prac7/frontend"
npm install
npm run dev
# React frontend running on http://localhost:5173
```
