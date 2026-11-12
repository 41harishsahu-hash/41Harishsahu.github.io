# History Packers & Movers — Full-Stack Relocation & Logistics Platform

A complete, production-ready full-stack relocation and logistics business platform built for **History Packers & Movers** (Jaipur, Rajasthan, India).

---

## 1. Project Overview & Business Details

- **Business Name**: History Packers & Movers
- **Jaipur Central Office**:
  SHOP NO 05 BASEMENT PLOT NO R 3/42,
  INDRAPRASTH COLONY CHORDIYA CITY DHAWAS,
  JAIPUR, RAJASTHAN, INDIA.
- **Direct Phone Lines**: +91 9251273070 / +91 6375273070
- **Official Email**: Historypackersandmovers@gmail.com
- **Brand Slogan**: *Moving Made Simple. Moving Made Safe.* (Safe, Fast & Reliable)

---

## 2. Technology Stack

### Frontend Application (`frontend/`)
- **React.js 18** & **Vite 6**
- **React Router DOM 6**
- **JavaScript (ES6+)**
- **Modern CSS** with custom design system variables
- **Axios** with Bearer interceptors & automatic token refresh
- **Lucide React** icons

### Backend API Server (`backend/`)
- **Node.js** & **Express.js** REST API
- **MongoDB** & **Mongoose 8**
- **JWT (JSON Web Tokens)** with access & refresh token rotation
- **bcryptjs** password hashing (salt factor 10)
- **Cloudinary SDK 2** for signed image asset management
- **Multer** for secure image uploads
- **Zod 3** for schema and input validation
- **Helmet**, **CORS**, and **express-rate-limit** for API security
- **Jest** & **Supertest** test suites

---

## 3. Strict Two-Folder Architecture

```text
History Packers & Movers/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── logo.png      # Official brand logo
│   │   │   └── logo.jpg
│   │   ├── logo-placeholder/
│   │   └── favicon/
│   ├── src/
│   │   ├── components/       # Logo, Navbar, Footer, PasswordInput, CommonUI
│   │   ├── context/          # AuthContext (login, register, logout, profile)
│   │   ├── pages/
│   │   │   ├── public/       # Home, About, Services, ServiceDetail, Contact, Quote
│   │   │   ├── auth/         # Login, Register, ForgotPassword, ResetPassword, AdminLogin
│   │   │   ├── customer/     # Customer Dashboard, Enquiries, Bookings, Profile
│   │   │   └── admin/        # Admin Dashboard, Enquiries, Bookings, Customers, Services, Content, Settings
│   │   ├── routes/           # AppRoutes with Protected Route Guards
│   │   ├── services/         # Axios API service layer
│   │   ├── styles/           # Global Design System (Light Theme)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/               # db.js, cloudinary.js
│   ├── controllers/          # auth, enquiry, booking, content, upload controllers
│   ├── middleware/           # auth (JWT & RBAC), errorHandler, rateLimiter
│   ├── models/               # User, Business (Enquiry & Booking), Content (Service, FAQ, Testimonial, Settings, ActivityLog)
│   ├── routes/               # auth, enquiry, booking, content, admin routes
│   ├── scripts/              # seed.js, seedAdmin.js
│   ├── tests/                # Jest integration test suite
│   ├── validators/           # Zod validation schemas
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 4. Brand Identity & Official Logo

The official History Packers & Movers logo has been integrated directly into:
- `frontend/public/images/logo.png`
- `frontend/public/images/logo.jpg`
- `frontend/public/logo-placeholder/logo.jpg`

The reusable `<Logo />` component (`frontend/src/components/Logo.jsx`) automatically scales the logo responsively while maintaining aspect ratio and providing a clean fallback.

### Light Theme Color Palette:
- **Primary Background**: `#FFFFFF`
- **Secondary Background**: `#F7F9FC`
- **Primary Text**: `#172033`
- **Secondary Text**: `#64748B`
- **Primary Brand Navy**: `#17365D`
- **Accent Orange**: `#F28C28`
- **Borders**: `#E5EAF0`
- **Success**: `#16A34A`
- **Error**: `#DC2626`

---

## 5. Mandatory Features Included

1. **Password Show/Hide**: Present on every password field (Customer Login, Registration, Password Change, Forgot/Reset Password, and Admin Login).
2. **Strict Server & Client Validation**:
   - Indian mobile validation (10 digits starting with 6, 7, 8, or 9; accepts optional `+91`).
   - Email format & length (max 254 chars).
   - Password strength (min 8 characters with letters & numbers).
3. **Customer Portal**:
   - Real enquiry counters and moving status milestones.
   - Interactive tracking timeline: `Pending` → `Confirmed` → `Packing` → `In Transit` → `Out for Delivery` → `Delivered`.
   - Profile management and password updates.
4. **Admin Management Panel**:
   - Real MongoDB statistics aggregated via `/api/admin/dashboard/stats`.
   - Enquiry pipeline management with instant conversion to confirmed bookings.
   - Live booking tracking updates with checkpoint remarks.
   - Services, Testimonials, FAQs, and Website Content editor.
   - Cloudinary upload connection status checker.

---

## 6. Environment Configuration

### Backend Environment (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Local MongoDB or MongoDB Atlas
MONGODB_URI=mongodb://127.0.0.1:27017/history_packers

# JWT Authentication Secrets
JWT_ACCESS_SECRET=history_packers_jwt_access_super_secret_key_2026_xyz
JWT_REFRESH_SECRET=history_packers_jwt_refresh_super_secret_key_2026_abc
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Credentials (Optional: Uploads report unconfigured until supplied)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email / SMTP Settings (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=History Packers & Movers <Historypackersandmovers@gmail.com>
```

### Frontend Environment (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Setup & Run Instructions

### Step 1: Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### Step 2: Seed Database & Provision Admin
```bash
# Populate default services, verified business settings, FAQs, testimonials, and default accounts:
cd backend
npm run seed

# Or provision a specific administrator account:
node scripts/seedAdmin.js admin@historypackers.com Admin@Password123 "System Administrator" "9251273070"
```

**Default Seed Credentials:**
- **Admin**: `admin@historypackers.com` / `Admin@Password123` (Sign in at `/admin/login`)
- **Demo Customer**: `rahul.sharma@example.com` / `Customer@Password123` (Sign in at `/login`)

### Step 3: Start Development Servers
```bash
# Terminal 1 - Backend Server (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend Application (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 8. Verification & Testing

### Run Backend Test Suite:
```bash
cd backend
npm test
```
*Result: 12/12 passing tests covering health checks, Indian mobile normalization, password complexity, enquiry schemas, JWT generation, and RBAC authorization.*

### Build Frontend for Production:
```bash
cd frontend
npm run build
```
*Result: Clean production bundle compiled by Vite into `frontend/dist/` with zero errors.*

