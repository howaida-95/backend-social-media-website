# Google OAuth in this MERN App (Interview Guide)

This project uses **Google OAuth 2.0 Authorization Code** flow (server redirect), then creates our own **application session** (JWT in an httpOnly cookie).

---

## 1. What problem does OAuth solve?

Users should log in without us storing their Google password.

- Google proves “this person owns this Google account”
- We trust Google’s proof
- We create / find a user in **our** MySQL database
- We issue **our** session (JWT cookie) for later API calls

OAuth is **not** “Google becomes our database.” Google only authenticates once; after that, the app uses its own auth.

---

## 2. Key terms 

| Term | Meaning |
|------|---------|
| **OAuth 2.0** | Protocol for delegated authorization / login with a provider |
| **OpenID Connect (OIDC)** | Layer on OAuth that adds identity (`id_token` with user profile claims) |
| **Client ID** | Public app identifier (safe in server config; not a password) |
| **Client Secret** | Private; **backend only** — used to exchange `code` for tokens |
| **Redirect URI** | Exact URL Google is allowed to send the user back to |
| **Authorization code** | Short-lived one-time code in the browser URL after Google login |
| **ID token** | JWT from Google proving user identity (`sub`, `email`, name, picture) |
| **Access token** | Token to call Google APIs (Gmail, Drive…). We mostly need identity, not Google APIs |
| **State** | Random value we set before redirect; must match on callback (CSRF protection) |
| **Our JWT** | App session token we sign with `JWT_SECRET` and store in httpOnly cookie |

Important line for interviews:

> “We use Google to verify identity, then we issue our own JWT session. We do not send Google tokens on every API request.”

---

## 3. Which flow we use (and why)

### Flow we implemented: Authorization Code (backend redirect)

```text
React
  │  1. "Continue with Google"
  ▼
Express  GET /api/v1/auth/google
  │  2. Save state cookie + redirect to Google
  ▼
Google
  │  3. User signs in / consents
  │  4. Redirect to backend with ?code=&state=
  ▼
Express  GET /api/v1/auth/google/callback
  │  5. Verify state
  │  6. Exchange code + client_secret → tokens
  │  7. Verify id_token → googleId, email, name, avatar
  │  8. Find / create user in Sequelize (MySQL)
  │  9. Sign our JWT → Set-Cookie (httpOnly)
  │ 10. Redirect to React (FRONTEND_URL)
  ▼
React
  │ later: axios withCredentials → cookie sent to /api/v1/...
```

### Alternative we did **not** keep: ID-token (GIS) flow

Frontend Google button → browser gets `credential` (ID token) → `POST /auth/google` → backend verifies ID token.

| | Authorization Code (ours) | ID-token (GIS) |
|--|---------------------------|----------------|
| Who talks to Google first | Backend redirect | Frontend JS library |
| Needs Client Secret | Yes | Usually no |
| Needs redirect URI | Yes (backend callback) | Mostly JS origins |
| Frontend complexity | Low (just a link) | Needs `@react-oauth/google` / GIS |
| Interview story | Classic OAuth code exchange | Modern SPA ID-token verify |

Both are valid. We chose code + redirect so the secret stays on the server and the story matches classic OAuth diagrams.

---

## 4. End-to-end MERN walkthrough (detailed)

### Step 0 — Setup (once)

**Google Cloud Console**

1. Create OAuth Client (Web application)
2. Authorized redirect URI (must match env exactly):

```text
http://localhost:5000/api/v1/auth/google/callback
```

3. Copy Client ID + Client Secret into backend `.env`

**Backend env**

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=...
```

**Frontend env**

```env
VITE_API_URL=http://localhost:5000/api/v1
```

No `VITE_GOOGLE_CLIENT_ID` required for this redirect flow.

---

### Step 1 — React: user clicks “Continue with Google”

Frontend does **not** call Google’s SDK.

It navigates the browser to the backend:

```ts
window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
// → http://localhost:5000/api/v1/auth/google
```

Why full navigation?
- OAuth redirect needs a top-level browser redirect
- Cookies for `state` and later session are set by Express responses

---

### Step 2 — Express: start OAuth (`GET /api/v1/auth/google`)

Controller: `googleAuth`

1. Generate random `state` (`crypto.randomBytes`)
2. Store it in httpOnly cookie `oauth_state` (short TTL, e.g. 10 minutes)
3. Build Google URL with `OAuth2Client.generateAuthUrl({ scope, state, ... })`
4. `res.redirect(googleUrl)`

Scopes we request:

- `openid` — OIDC identity
- `email`
- `profile`

**Interview point — why `state`?**

Prevents CSRF: an attacker should not be able to trick a victim’s browser into finishing OAuth with an attacker-controlled code. Callback must return the same `state` we stored.

---

### Step 3 — Google login / consent

User authenticates with Google (password / 2FA / account picker).

Google then redirects to **our backend** (not React):

```text
http://localhost:5000/api/v1/auth/google/callback?code=XXXX&state=YYYY
```

- `code` = authorization code (one-time, short-lived)
- `state` = must match our cookie

If user cancels, Google may send `?error=access_denied` → we redirect to Sign In with an error query.

---

### Step 4 — Express callback (`GET /api/v1/auth/google/callback`)

Controller: `googleCallback`

1. Read `code`, `state` from query
2. Read `oauth_state` cookie
3. Clear the state cookie
4. Reject if missing / mismatch → redirect to `/signIn?error=...`
5. Call service `loginWithGoogleCode(code)`

---

### Step 5 — Exchange code for tokens (server-to-server)

Service: `loginWithGoogleCode`

```text
Backend ──(code + client_id + client_secret + redirect_uri)──► Google token endpoint
Backend ◄── id_token (+ access_token, etc.) ────────────────── Google
```

This happens **only on the server**. The browser never sees the client secret.

Then we verify the `id_token` with `verifyIdToken` and audience = our Client ID.

From Google payload we use:

| Claim | Our field |
|-------|-----------|
| `sub` | `googleId` (stable Google user id) |
| `email` | `email` |
| `given_name` / `family_name` | `firstName` / `lastName` |
| `picture` | `avatar` |

---

### Step 6 — Sequelize / MySQL: find or create user

Business rules in this project:

1. Find by `googleId`
2. Else find by `email`
   - If local password account exists without Google → **error** (do not silently merge; avoid account takeover)
   - Else link `googleId` / mark email verified
3. Else create user:
   - `provider: 'google'`
   - `password: null`
   - unique `username` from email prefix
   - `emailVerified: true`

**Interview point — why `password` nullable?**

OAuth users never set a password. Local users have bcrypt hashes. Same `users` table, different `provider`.

---

### Step 7 — Create **our** session (not Google’s)

```text
signToken(userId, role) → JWT signed with JWT_SECRET
Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Secure(in prod)
```

Then:

```text
res.redirect(FRONTEND_URL)  // e.g. http://localhost:5173/
```

After this, Google tokens are done. Ongoing auth is **our JWT cookie**.

---

### Step 8 — React after redirect

On app load:

1. `AuthProvider` calls `GET /api/v1/auth/me` with `axios` `withCredentials: true`
2. Browser attaches httpOnly cookie automatically
3. If 200 → user is logged in
4. If 401 → show public auth pages

Protected routes check `user` from context, not `localStorage.token`.

---

## 5. Where each part of MERN fits

| Layer | Responsibility in OAuth |
|-------|-------------------------|
| **Mongo/MySQL (here: MySQL + Sequelize)** | Persist user (`googleId`, email, provider, …) |
| **Express** | Redirect to Google, exchange code, verify id_token, set cookie |
| **React** | Start login (link), restore session via `/me`, protect routes |
| **Node** | Runtime for Express + `google-auth-library` |

---

## 6. Security checklist (good interview answers)

1. **Client secret only on backend** — never in Vite env
2. **Exact redirect URI allowlist** in Google Console
3. **`state` cookie** validated on callback
4. **Verify `id_token` audience** = our Client ID
5. **httpOnly cookie** for our JWT → JS cannot steal it via XSS as easily as `localStorage`
6. **SameSite=Lax** + CORS `credentials: true` + fixed `FRONTEND_URL` origin
7. **Do not auto-link** Google login to an existing password account without proof (we block / ask password login)
8. Rate-limit `/google` and `/google/callback`

---

## 7. Code map (this repo)

| File | Role |
|------|------|
| `src/config/env.ts` | `GOOGLE_CLIENT_ID`, `SECRET`, `REDIRECT_URI`, `FRONTEND_URL` |
| `src/modules/auth/auth.routes.ts` | `GET /google`, `GET /google/callback` |
| `src/modules/auth/auth.controller.ts` | state cookie, redirects, set JWT cookie |
| `src/modules/auth/auth.service.ts` | `getGoogleAuthUrl`, `loginWithGoogleCode`, user upsert |
| `src/utils/jwt.ts` | sign / verify app JWT, cookie options |
| `src/modules/users/user.model.ts` | `provider`, `googleId`, nullable `password` |

---

## 8. How to explain it in 60 seconds (script)

> “We use Google OAuth authorization code flow. The React app sends the user to our Express `/auth/google` endpoint. Express stores a CSRF `state` cookie and redirects to Google. After login, Google redirects to our `/auth/google/callback` with a one-time code. The backend exchanges that code using the client secret for an ID token, verifies it, then finds or creates the user in MySQL. Finally we issue our own JWT in an httpOnly cookie and redirect back to the SPA. From then on, React calls `/auth/me` with credentials; Google is no longer involved.”

---

## 9. Likely interview Q&A

**Q: Why not put the JWT in localStorage?**  
A: XSS can steal it. httpOnly cookies are not readable by JS. We pair that with SameSite and strict CORS.

**Q: Why exchange the code on the server?**  
A: Client secret must stay private. Code exchange proves our backend is the registered app.

**Q: Difference between Google access token and our JWT?**  
A: Google access token calls Google APIs. Our JWT authorizes requests to *our* API.

**Q: What is `sub`?**  
A: Google’s stable user id. We store it as `googleId`. Prefer linking by `sub`, not only email.

**Q: What if email already exists with password?**  
A: We reject silent linking to prevent account takeover; user should log in with password (or we add an explicit link flow later).

**Q: Redirect URI mismatch error?**  
A: The URI in Google Console must exactly match `GOOGLE_REDIRECT_URI` (scheme, host, port, path, no accidental spaces).

**Q: Can mobile apps use the same flow?**  
A: Similar idea, but often PKCE / different client type. For SPA + API, redirect or ID-token are the common web patterns.

---

## 10. Manual test path

1. Add redirect URI in Google Console  
2. Start backend + frontend  
3. Open Sign In → Continue with Google  
4. Complete Google consent  
5. Land on frontend home with cookie set  
6. `GET /api/v1/auth/me` succeeds (Postman: cookie jar, or browser Network tab)  
7. Logout clears cookie; `/me` returns 401  

---

## 11. One-diagram summary

```text
[React] --navigate--> [Express /google] --redirect--> [Google]
                                                      |
                                                user consents
                                                      |
[React home] <--redirect+Set-Cookie-- [Express /callback] <--code-- [Google]
                                         |              \
                                    exchange code         verify state
                                         |
                                    verify id_token
                                         |
                                    MySQL user upsert
                                         |
                                    sign app JWT cookie
```

That is the full OAuth story for this project — identity from Google, session owned by our MERN backend.
