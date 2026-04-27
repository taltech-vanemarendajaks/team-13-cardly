## Local Auth Testing

Google OAuth now uses a cookie-based refresh flow:

- `GET /auth/google` starts the OAuth flow
- `GET /auth/google/callback` sets the refresh token as an `HttpOnly` cookie and redirects to the frontend
- `POST /auth/refresh` reads the refresh token from the cookie and returns only a short-lived access token
- `POST /auth/logout` clears the refresh-token cookie and revokes the stored refresh-token hash in the database


Local development defaults:

- refresh-token cookie uses `secure=false`
- refresh-token cookie uses `SameSite=Lax`
- frontend requests to the backend must include credentials, for example `fetch(..., { credentials: 'include' })`

Production defaults:

- refresh-token cookie must use `secure=true`
- backend must be served over HTTPS
- for cross-site frontend/backend deployments, use `SameSite=None`
- frontend requests must still include credentials

When testing locally, expect `/auth/refresh` responses to return only:

- `accessToken`
- `accessTokenExpiresIn`


- click `Login With Google`
- after Google redirects back with `?auth=success`, the frontend logs `Testing authToken:` and the access token in the browser console
- click `Refresh Token` to call `/auth/refresh` and log `New access token:`
- click `Logout` to call `/auth/logout` with the in-memory access token
- inspect the browser Network tab for `/auth/refresh` and `/auth/logout`