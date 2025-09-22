# User Management Module

## Overview

The User Management Module extends the Public Transportation Management System with comprehensive user role management capabilities. This module allows administrators to manage users with different roles (passengers, drivers, and admins) through a dedicated dashboard interface.

## Features

### 1. **Role-Based User System**
- **Passenger Role**: Default role for regular users signing up through the public registration
- **Driver Role**: Assigned to bus drivers (admin-created only)
- **Admin Role**: Full system access and user management capabilities (admin-created only)

### 2. **Database Schema**
The User model has been extended with a `role` field:
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: {
    type: String,
    enum: ['passenger', 'driver', 'admin'],
    default: 'passenger'
  },
  timestamps: true
}
```

### 3. **Admin Dashboard Features**
- **User Statistics Cards**: Display counts of passengers, drivers, and admins
- **User Management Table**: View all users with filtering by role
- **CRUD Operations**: Create, read, update, and delete users
- **Role Assignment**: Admins can assign/change user roles
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### User Management Routes (`/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users (optional role filter) | Admin |
| GET | `/users/stats` | Get user statistics by role | Admin |
| GET | `/users/:id` | Get single user by ID | Admin |
| POST | `/users` | Create new user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Example API Usage

#### Get User Statistics
```javascript
GET /users/stats
Response: {
  "success": true,
  "stats": {
    "passengers": 150,
    "drivers": 25,
    "admins": 3,
    "total": 178
  }
}
```

#### Create New User
```javascript
POST /users
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.driver@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "role": "driver"
}
```

## Installation & Setup

### 1. **Backend Setup**
The backend changes are already integrated. Ensure your MongoDB connection is working.

### 2. **Create Initial Admin User**
Run the seeder script to create the first admin user:
```bash
cd backend
npm run seed-admin
```

**Default Admin Credentials:**
- Email: `admin@transport.com`
- Password: `Admin123!`
- Role: `admin`

**⚠️ Important**: Change the default password after first login.

### 3. **Frontend Access**
Access the user management dashboard at: `http://localhost:3000/users`

**Navigation**: Admin Dashboard → User Management (in the sidebar)

## Usage Guide

### For Administrators

#### Accessing User Management
1. Sign in with admin credentials
2. Navigate to `/admin` for the admin dashboard
3. Click "User Management" in the sidebar menu
4. You'll see the user management interface with statistics and user table

#### Managing Users
1. **View Statistics**: The top cards show counts of each user type
2. **Filter Users**: Use the dropdown to filter by role (All, Passengers, Drivers, Admins)
3. **Create User**: Click "Create New User" button to add new users with specific roles
4. **Edit User**: Click "Edit" button in the actions column to modify user details
5. **Delete User**: Click "Delete" button to remove users (with confirmation)

#### Creating Driver/Admin Accounts
1. Click "Create New User"
2. Fill in all required fields
3. Select "driver" or "admin" from the Role dropdown
4. Set a secure password
5. Click "Create User"

### For Regular Users
- Regular users signing up through `/signup` automatically receive the "passenger" role
- Only administrators can create users with "driver" or "admin" roles
- User role is now included in authentication responses

## Security Features

### Password Requirements
- Minimum 8 characters
- Must include: uppercase letter, lowercase letter, number, and special character
- Validated on both frontend and backend

### Role-Based Access
- Only admin users can access user management features
- Default signup creates passenger accounts only
- Role elevation requires admin intervention

### Data Validation
- Email uniqueness enforced
- Phone number format validation
- Input sanitization and validation on all endpoints

## File Structure

### Backend Files
```
backend/
├── models/
│   └── User.js (extended with role field)
├── routes/
│   ├── auth.js (updated to include role in responses)
│   └── users.js (new user management routes)
├── seedAdmin.js (admin user seeder)
└── server.js (updated with user routes)
```

### Frontend Files
```
frontend/src/
├── components/
│   ├── UserManagement.js (main user management component)
│   └── OffCanvas.js (updated navigation)
├── styles/
│   └── UserManagement.css (styling for user management)
└── App.js (updated with user management routes)
```

## Database Migration

If you have existing users in your database, they will automatically receive the default "passenger" role due to the schema default. No manual migration is required.

## Error Handling

The system includes comprehensive error handling for:
- Invalid role assignments
- Duplicate email addresses
- Password validation failures
- Network connectivity issues
- Database operation failures

## Future Enhancements

Potential improvements for the user management module:
1. **Bulk User Operations**: Import/export users via CSV
2. **Advanced Filtering**: Search by name, email, or registration date
3. **User Activity Logs**: Track user actions and login history
4. **Email Notifications**: Send welcome emails to new users
5. **Password Reset**: Admin-initiated password reset functionality
6. **Profile Pictures**: User avatar upload and management

## Troubleshooting

### Common Issues

1. **Admin Seeder Fails**
   - Ensure MongoDB is running and accessible
   - Check if admin user already exists
   - Verify .env file has correct MONGODB_URL

2. **User Management Page Not Loading**
   - Verify the route is correctly added to App.js
   - Check browser console for JavaScript errors
   - Ensure backend server is running on port 8070

3. **Permission Errors**
   - Ensure you're logged in as an admin user
   - Check user role in localStorage after login
   - Verify backend routes are properly protected

### Support
For additional support or feature requests, please refer to the main project documentation or contact the development team.

---

**Note**: This user management module is designed to be secure and scalable. Always follow security best practices when deploying to production environments.
