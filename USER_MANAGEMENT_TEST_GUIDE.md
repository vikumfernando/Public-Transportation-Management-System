# User Management System - Test Guide

## Quick Start Testing

### 1. **Server Status**
- ✅ Backend server should be running on `http://localhost:8070`
- ✅ Frontend application should be running on `http://localhost:3000`

### 2. **Admin Account Access**
Use the pre-created admin account:
- **Email**: `admin@transport.com`
- **Password**: `Admin123!`
- **Role**: `admin`

### 3. **Testing Steps**

#### Step 1: Admin Login
1. Navigate to `http://localhost:3000/signin`
2. Login with admin credentials above
3. Should redirect to home page with "Welcome, System!" message

#### Step 2: Access User Management
1. Navigate to `http://localhost:3000/users` 
   OR
2. Go to `http://localhost:3000/admin` → Click hamburger menu → Click "User Management"

#### Step 3: Verify Dashboard
You should see:
- **3 Statistics Cards**: Passengers, Drivers, Admins counts
- **User Table**: Showing the admin user you just logged in with
- **Filter Dropdown**: "All Users", "Passengers", "Drivers", "Admins"
- **Create New User Button**: Blue button on the right

#### Step 4: Test User Creation
1. Click "Create New User" button
2. Fill in the form:
   - First Name: `John`
   - Last Name: `Driver`
   - Email: `john.driver@test.com`
   - Phone: `1234567890`
   - Password: `TestPass123!`
   - Role: `driver`
3. Click "Create User"
4. Should show success message and new user appears in table

#### Step 5: Test User Management
1. **Filter Test**: Select "Drivers" from filter dropdown - should show only driver users
2. **Edit Test**: Click "Edit" button on a user → Modify details → Save
3. **Role Change**: Edit a user and change their role from dropdown
4. **Delete Test**: Click "Delete" button → Confirm deletion

### 4. **Expected Results**

#### Statistics Cards Should Show:
- **Passengers**: Count of users with role "passenger"
- **Drivers**: Count of users with role "driver"  
- **Admins**: Count of users with role "admin" (starts with 1)

#### User Table Should Display:
- Full name (First + Last)
- Email address
- Phone number
- Role badge (colored: blue=passenger, green=driver, yellow=admin)
- Creation date
- Edit/Delete action buttons

### 5. **API Endpoints Working**
The following endpoints should be functional:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users` | GET | Get all users (with optional role filter) |
| `/users/stats` | GET | Get user statistics |
| `/users` | POST | Create new user |
| `/users/:id` | PUT | Update user |
| `/users/:id` | DELETE | Delete user |

### 6. **Test User Creation from Public Signup**
1. Navigate to `http://localhost:3000/signup`
2. Create a new account with regular signup
3. Check that this user appears with "passenger" role in admin dashboard

### 7. **Mobile Responsiveness**
- Test the user management interface on mobile devices
- Cards should stack vertically
- Table should scroll horizontally on small screens
- Modals should be mobile-friendly

## Troubleshooting

### Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running and .env file has correct MONGODB_URL
- **Port Conflicts**: Backend runs on port 8070, ensure it's available
- **Missing Dependencies**: Run `npm install` in backend folder

### Frontend Issues  
- **CORS Errors**: Backend has CORS enabled for localhost:3000
- **API Connection**: Check browser network tab for failed API calls
- **Component Errors**: Check browser console for React errors

### Database Issues
- **No Admin User**: Run `npm run seed-admin` in backend folder
- **Connection Errors**: Verify MongoDB URL in .env file
- **Permission Issues**: Ensure MongoDB user has read/write permissions

## Success Indicators

✅ **Everything Working When:**
- Admin can login successfully
- User management page loads without errors
- Statistics cards show correct counts
- User table displays data properly
- CRUD operations work (Create, Read, Update, Delete)
- Role filtering functions correctly
- Modals open and close properly
- Form validation works
- Success/error messages appear
- Mobile interface is responsive

## Next Steps After Testing

1. **Change Default Password**: Update admin password from default
2. **Create Driver Accounts**: Add bus driver users with "driver" role
3. **Create Additional Admins**: Add more admin users as needed
4. **Test Role-Based Features**: Implement role-specific functionality in other parts of the app
5. **Deploy to Production**: Configure for production environment

---

**Note**: This user management system provides the foundation for role-based access control throughout your transportation management application.
