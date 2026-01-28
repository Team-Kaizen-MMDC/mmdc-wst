# Day 1 Authentication Testing Guide

## Prerequisites

1. Ensure MongoDB Atlas is running and connection string is in `.env`:

   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key-at-least-32-characters-long
   USE_MONGOOSE=true
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

## Testing Endpoints

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2026-01-28T...",
  "environment": "development"
}
```

### 2. Register New User (Jobseeker)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'
```

Expected response:

```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "testuser@example.com",
      "role": "jobseeker"
    }
  }
}
```

**Save the token for next requests!**

### 3. Register New User (Employer)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@company.com",
    "password": "password123",
    "role": "employer"
  }'
```

### 4. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

Expected response:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "testuser@example.com",
      "role": "jobseeker"
    }
  }
}
```

### 5. Get Current User (Protected Route)

```bash
# Replace YOUR_TOKEN with the token from login/register
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "testuser@example.com",
      "role": "jobseeker",
      "isActive": true,
      "isEmailVerified": false,
      "loginAttempts": 0,
      "createdAt": "...",
      "updatedAt": "...",
      "id": "..."
    }
  }
}
```

### 6. Test Invalid Token

```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

Expected response:

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 7. Test Login with Wrong Password (Triggers Login Attempts)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "wrongpassword"
  }'
```

Expected response (401):

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

After 5 failed attempts, account will be locked for 2 hours.

### 8. Test Duplicate Registration

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'
```

Expected response (400):

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### 9. Logout (Protected)

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logout successful"
}
```

## Testing Checklist

- [ ] Health check endpoint returns 200
- [ ] Can register new jobseeker user
- [ ] Can register new employer user
- [ ] Cannot register with existing email (400 error)
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid password
- [ ] JWT token is returned on login/register
- [ ] Can access protected route with valid token
- [ ] Cannot access protected route without token (401)
- [ ] Cannot access protected route with invalid token (401)
- [ ] Login attempts increment on wrong password
- [ ] Account locks after 5 failed attempts
- [ ] Logout endpoint works
- [ ] Password is hashed in database (not plain text)

## Verify in MongoDB Atlas

1. Go to MongoDB Atlas → Browse Collections
2. Check `users` collection
3. Verify:
   - User documents are created
   - Passwords are hashed (bcrypt format: `$2a$12$...`)
   - Roles are correct
   - Timestamps are present

## Day 1 Success Criteria

✅ All authentication endpoints working  
✅ JWT tokens generated and verified  
✅ Password hashing functional  
✅ Test users created in MongoDB  
✅ Protected routes require authentication  
✅ Security middleware active (helmet, cors, rate limiting)  
✅ Error handling comprehensive

## Next Steps

Once all tests pass:

- Update `BACKEND_IMPLEMENTATION_PLAN.md` Day 1 checkboxes
- Proceed to Day 2: User Profile Management
