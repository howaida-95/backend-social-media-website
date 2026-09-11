Big picture flow
Register / Login (email+password)
        │
        ├── JWT → client (Bearer) → auth middleware → protected routes
        │
Google OAuth ──► verify Google token → find/create user → same JWT
        │
Forgot password → email with reset link → Reset password → new hash

=========================================================================
Phase 1 — Schema & env (backend)
1. Extend the User model / migration
Add fields like:

Field	               Purpose
=====                  =======
password               nullable (OAuth users)
provider               'local' | 'google'
googleId               unique, nullable
resetPasswordToken     hashed token, nullable
resetPasswordExpires   datetime, nullable
emailVerified          optional but useful

2. Env vars
Backend
- JWT_SECRET, JWT_EXPIRES_IN
- FRONTEND_URL (CORS + reset/OAuth redirects)
- SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
- Google: GOOGLE_CLIENT_ID (and secret if you use server redirect flow)

Frontend
- VITE_API_URL
- VITE_GOOGLE_CLIENT_ID
---------------------------------------------------------------------------
Phase 2 — Custom email/password auth
=> Backend structure
src/modules/auth/
  auth.controller.ts
  auth.service.ts
  auth.routes.ts
  auth.validation.ts
src/utils/password.ts      // hash / compare (bcrypt 12, same as seeder)
src/utils/jwt.ts           // sign / verify
src/middlewares/auth.middleware.ts


=> Endpoints

Method	                   Path	                             Behavior
POST               /api/v1/auth/register
                                                            Validate → 
                                                            hash password → 
                                                            create user → 
                                                            return JWT + user

POST                /api/v1/auth/login
                                                            Find by email → 
                                                            compare password → 
                                                            check isActive → JWT

POST                /api/v1/auth/logout
                                                            Client discards token 
                                                            (optional blacklist later)
                                                            
GET                 /api/v1/auth/me
                                                            Auth middleware → 
                                                            return current user




Register flow
=============
Zod: email, password strength, username, names
Reject if email/username exists
bcrypt.hash(password, 12)
Create user (provider: 'local')
Sign JWT { sub: userId, role }
Return { user, accessToken } (never return password)

Login flow
==========
Zod: email, password
Find user by email (include password hash)
Reject if missing, provider !== 'local', or no password
bcrypt.compare
Reject if !isActive
Sign JWT { sub: userId, role }
Return { user, accessToken } (strip password)

Logout
======
Stateless JWT: client deletes token from storage
Optional later: refresh tokens / server blacklist

GET /me
=======
Authorization: Bearer <token>
Middleware: verify JWT → load user → req.user
Return public user fields only


Auth middleware

Extract Bearer token → jwt.verify → load User by sub →
check isActive → attach req.user → next
On fail → 401
Wire-up

Mount auth.routes at /api/v1/auth in routes/index.ts / app.ts
Load JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL in env.ts
Response helper: consistent { data, message } 
---------------------------------------------------------------------------
Phase 3 — Google OAuth (ID-token flow)
Endpoint

Method	             Path	        Behavior
POST          /api/v1/auth/google
                                        Verify Google ID token → 
                                        find/create user → same JWT
                                        Flow

=> Frontend: 
Google Identity Services / @react-oauth/google → get credential (ID token)
=> Backend: 
google-auth-library OAuth2Client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })
Read sub (googleId), email, given_name, family_name, picture
Find by googleId or email:
- Exists + google → login
- Exists + local same email → either link googleId / provider or return clear error 
(pick one policy)
- None → create user: provider: 'google', password: null, username from email prefix (ensure unique)
Sign same JWT → { user, accessToken }
Deps / env

Backend: google-auth-library, GOOGLE_CLIENT_ID
Frontend: VITE_GOOGLE_CLIENT_ID
---------------------------------------------------------------------------
Phase 4 — Forgot / reset password
Endpoints

Method	                   Path	                     Behavior
POST            /api/v1/auth/forgot-password
                                                        Always generic success; 
                                                        if local user exists, 
                                                        email reset link

POST           /api/v1/auth/reset-password
                                                        Validate token + new password → 
                                                        hash → 
                                                        clear reset fields
                                                        

=> Forgot flow
Zod: email
Find local user (ignore OAuth-only or respond same message)
crypto.randomBytes(32).toString('hex') → store hashed token + expiry (e.g. 1h)
Email link: ${FRONTEND_URL}/reset-password?token=<rawToken>
Mailer util (nodemailer): SMTP_*, EMAIL_FROM

=> Reset flow
Zod: token, password (strength rules same as register)
Hash incoming token → find user where token matches and expires > now
Set new password hash; clear resetPasswordToken / resetPasswordExpires
Optionally issue JWT or force re-login
---------------------------------------------------------------------------
Phase 5 — Frontend wiring
- Env: 
VITE_API_URL → point at /api/v1 (or prefix paths); 
VITE_GOOGLE_CLIENT_ID
- Auth storage: accessToken in localStorage (or memory + refresh later)
- Axios: attach Authorization: Bearer; on 401 clear token → redirect SignIn
AuthProvider from your AuthContextValue: login/register/logout/me, user, isAuthenticated
- Pages: 
SignIn (real form), 
SignUp (firstName, lastName, username, email, password — match backend), 
ForgotPassword, 
ResetPassword
- Guards: ProtectedRoute / PublicRoute use real token, not token = true
- Services: register, login, logout, me, google, forgot, reset
Google button on SignIn/SignUp → POST /auth/google
---------------------------------------------------------------------------
Phase 6 — Security & polish
Rate-limit auth routes (especially login / forgot-password)
Helmet + CORS with FRONTEND_URL
Never log passwords/tokens
Uniform errors (no “email exists” vs “wrong password” on login — optional hardening)
Validate env on startup
---------------------------------------------------------------------------
Phase 7 — Test checklist
Register success; duplicate email/username → 409
Login success with seed users (Password123!); wrong password → 401
Inactive user blocked
/me with valid JWT; without → 401
Google: new user + existing google user
OAuth user cannot login with password
Forgot → email (or Ethereal/Mailtrap in dev); reset success; expired/invalid token fails
CORS from frontend origin
Protected frontend routes redirect when logged out
Suggested implementation order
Migration + User model fields
password.ts + jwt.ts + auth middleware
Register / Login / Me / Logout
Frontend AuthProvider + SignIn/SignUp
Google OAuth
Forgot/reset + SMTP
Rate limits + checklist
If you want, switch to Agent mode and I can write this straight into docs/auth.md (and/or start Phase 1 in code).


