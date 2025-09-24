# 🌿 Ecotransit User Management System

A comprehensive MERN stack User Management System with advanced security features, real-time validation, and beautiful Ecotransit branding.

## ✨ Features Implemented

### 🔐 Secure Account Access
- ✅ **User Registration**: First Name, Last Name, Email, Phone Number, Password, Confirm Password
- ✅ **Multi-Role Sign In**: Users, Admins, Drivers with email/password authentication
- ✅ **Google OAuth Integration**: Ready for one-click authentication (placeholder implemented)
- ✅ **Email Verification**: Required after sign-up with 24-hour expiry
- ✅ **Forgot Password Flow**: Secure email reset link with 1-hour expiry
- ✅ **Account Lockout**: 3 failed attempts → 30-minute lockout or password reset
- ✅ **Remember Me**: Extends session to 30 days securely

### ✅ Real-Time Validation
- ✅ **Live Validation**: Instant feedback with visual indicators
- ✅ **Visual Indicators**: 🟢 Green checkmark, 🔴 Red X, ⏳ Spinner for loading
- ✅ **Pattern Matching**: Email and phone number validation
- ✅ **Length Rules**: Detailed error messages for all fields
- ✅ **Touch Tracking**: Errors only show after user interaction

### 🔒 Password Security
- ✅ **5-Level Strength Meter**: Visual feedback from weak to strongest
- ✅ **Auto-Generate Password**: Strong password generator with refresh
- ✅ **Show/Hide Toggles**: For both password and confirm password fields
- ✅ **Confirmation Validation**: Real-time password matching
- ✅ **Complexity Enforcement**: Uppercase, lowercase, numbers, special characters

### 📧 Email Handling
- ✅ **Duplicate Prevention**: Real-time email availability checking
- ✅ **Verification Required**: Dashboard access blocked until verified
- ✅ **Expired Link Handling**: Re-send option for expired verification links
- ✅ **Beautiful Email Templates**: Branded HTML emails with security information

### 🛡️ Security Features
- ✅ **Account Lockout**: After 3 failed attempts with email notification
- ✅ **JWT-based Sessions**: HttpOnly cookies with 15-minute expiry
- ✅ **Session Invalidation**: Browser back button protection
- ✅ **Auto-logout**: After 30 minutes of inactivity
- ✅ **Security Indicators**: Last login date/time in dashboard
- ✅ **Rate Limiting**: Protection against brute force attacks

### 🎨 Ecotransit Branding
- ✅ **Primary Color**: Deep Green (#0B5648) - eco-trust and stability
- ✅ **Secondary Color**: Light Green (#8CDB66) - growth and positivity
- ✅ **Background Colors**: Soft Beige (#F0EBE8) and White (#FFFFFF)
- ✅ **Typography**: Poppins for headlines, Roboto for body text
- ✅ **Responsive Design**: Desktop, tablet, and mobile optimized
- ✅ **Smooth Animations**: Framer Motion transitions and micro-interactions

### 🎭 UI Themes
- ✅ **EcoShield Theme**: Futuristic eco-security with dark green gradients
- ✅ **Minimal Nature Theme**: Clean, calm, eco-inspired with light backgrounds
- ✅ **Animated Elements**: Floating leaves, gradient backgrounds, hover effects

## 🏗️ Architecture

### Backend Structure
```
backend/
├── controllers/
│   └── authController.js       # Authentication logic
├── middleware/
│   ├── auth.js                # JWT authentication & session management
│   ├── validation.js          # Input validation rules
│   └── rateLimiter.js         # Rate limiting protection
├── models/
│   └── User.js                # User schema with security features
├── routes/
│   └── auth.js                # Authentication endpoints
├── services/
│   └── emailService.js        # Email templates and sending
└── server.js                  # Express server with CORS and security
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── AuthLayout.js      # Shared layout with branding
│   │   ├── AuthLayout.css     # Comprehensive styling
│   │   ├── InputField.js      # Smart input with validation
│   │   ├── RegisterForm.js    # Registration with real-time validation
│   │   ├── LoginForm.js       # Login with attempt tracking
│   │   ├── EmailVerification.js # Email verification flow
│   │   ├── ForgotPassword.js  # Password reset request
│   │   └── ResetPassword.js   # New password creation
│   ├── Dashboard.js           # Protected dashboard with user info
│   └── ProtectedRoute.js      # Route protection and session management
├── contexts/
│   └── AuthContext.js         # Global authentication state
├── services/
│   └── api.js                 # API calls with token refresh
├── utils/
│   └── validation.js          # Client-side validation utilities
└── App.js                     # Main app with routing
```

## 🚀 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration (rate limited)
- `POST /login` - User login (rate limited)
- `POST /logout` - Secure logout
- `GET /verify-email?token=` - Email verification
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /check-email?email=` - Check email availability
- `GET /generate-password` - Generate strong password
- `GET /me` - Get current user (protected)
- `POST /refresh-token` - Refresh access token

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URL=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8070/api
```

## 📦 Installation & Setup

### Backend Setup
```bash
cd backend
npm install
# Configure your .env file with database and email credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔐 Security Features Implemented

### Password Security
- **Strength Validation**: 5-level meter using zxcvbn algorithm
- **Complexity Requirements**: Uppercase, lowercase, numbers, special characters
- **Auto-generation**: Cryptographically secure password generation
- **Hashing**: bcrypt with salt rounds of 12

### Session Management
- **JWT Tokens**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Longer-lived refresh tokens (7 days / 30 days with remember me)
- **HttpOnly Cookies**: Secure cookie storage
- **Session Invalidation**: Browser back button protection
- **Auto-logout**: Inactivity timeout

### Account Protection
- **Rate Limiting**: Multiple layers of protection
- **Account Lockout**: Progressive lockout after failed attempts
- **Email Notifications**: Security alerts for lockouts
- **Token Expiry**: Time-limited verification and reset tokens

### Data Validation
- **Server-side Validation**: Express-validator with custom rules
- **Client-side Validation**: Real-time feedback with debouncing
- **Sanitization**: Input cleaning and normalization
- **CORS Protection**: Configured for frontend domain

## 🎨 UI/UX Features

### Real-time Validation
- **Debounced Checking**: 500ms delay for optimal performance
- **Visual Feedback**: Color-coded states with icons
- **Progressive Enhancement**: Validation only after user interaction
- **Accessibility**: ARIA labels and keyboard navigation

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Appropriate button sizes and spacing
- **Performance**: Optimized animations and loading states

### Branding Integration
- **Consistent Colors**: Ecotransit green palette throughout
- **Typography**: Professional font pairing
- **Iconography**: Eco-themed icons and elements
- **Animations**: Subtle, purposeful motion design

## 🔄 User Flow

1. **Registration**: User signs up → Email verification required → Dashboard access
2. **Login**: Credentials → Success/Lockout → Dashboard/Admin panel
3. **Password Reset**: Email request → Secure token → New password → Login
4. **Session Management**: Auto-refresh → Inactivity logout → Back button protection

## 🚀 Next Steps

1. **Google OAuth**: Complete integration with Google OAuth 2.0
2. **Profile Management**: Add user profile editing capabilities
3. **Admin Panel**: Enhanced admin user management
4. **Audit Logging**: Track user activities and security events
5. **Two-Factor Authentication**: Add TOTP/SMS 2FA option

## 📞 Support

For technical support or questions about the User Management System:
- Email: support@ecotransit.com
- Security: security@ecotransit.com

---

**Built with ❤️ for sustainable transportation** 🌱
