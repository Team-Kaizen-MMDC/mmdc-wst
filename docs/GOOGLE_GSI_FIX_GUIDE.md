# Google Identity Services (GSI) Configuration Fix Guide

## Problem Summary

The current codebase uses **Google Identity Services (GSI)** for client-side authentication, but the Google Cloud Console might be configured for traditional **OAuth 2.0 redirect flow**. This causes GSI to fail silently.

## Your Current Setup vs Working Setup

### Working Implementation (node-study repo)

- **Method:** OAuth 2.0 redirect flow (Passport.js)
- **Google Console:** Authorized redirect URIs configured
- **Flow:** User clicks → Redirects to Google → Returns to `/auth/google/callback` → 302 to `/profile`
- **Request:** `GET /auth/google/callback?code=...`

### Current Implementation (mmdc-wst)

- **Method:** Google Identity Services (GSI) with One Tap
- **Google Console:** Needs Authorized JavaScript origins
- **Flow:** User clicks GSI button → JS gets JWT token → POST to `/api/v1/auth/google`
- **Request:** `POST /api/v1/auth/google` with `{googleToken: "eyJhb..."}`

## Solution: Fix Google Cloud Console Configuration

### Step 1: Open Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project (the one with Client ID: `499275020147-ba9rf5d44hvik975u4pgm5a0ng62ih1c`)
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Configure OAuth 2.0 Client ID

Click on your OAuth 2.0 Client ID (`499275020147-ba9rf5d44hvik975u4pgm5a0ng62ih1c`)

#### **Authorized JavaScript origins** (REQUIRED for GSI)

Add these origins:

```
http://localhost:3000
http://127.0.0.1:3000
```

For production, add:

```
https://yourdomain.com
https://www.yourdomain.com
```

#### **Authorized redirect URIs** (Optional - only if you want OAuth flow too)

You can keep existing redirect URIs if you want to support both methods:

```
http://localhost:3000/auth/google/callback
```

**Key Point:** For GSI to work, you MUST have **Authorized JavaScript origins** configured. Redirect URIs are NOT used by GSI.

### Step 3: Verify Client ID in Code

Your `.env` file shows:

```bash
GOOGLE_CLIENT_ID=499275020147-ba9rf5d44hvik975u4pgm5a0ng62ih1c.apps.googleusercontent.com
```

This should match exactly with what's in Google Cloud Console.

### Step 4: Test Configuration

1. Start your backend server:

```bash
cd backend
npm start
```

2. Open DevTools Console and check:

```javascript
// Visit http://localhost:3000/pages/signin.html
// Check console for errors like:
// - "Unauthorized JavaScript origin"
// - "Invalid client"
// - "Popup closed by user"
```

3. Check Network tab:
   - `GET /config` should return: `{"googleClientId":"499275020147-ba9rf5d44hvik975u4pgm5a0ng62ih1c.apps.googleusercontent.com"}`
   - GSI library should load: `https://accounts.google.com/gsi/client`

## Common GSI Errors & Fixes

### Error: "Unauthorized JavaScript origin"

**Cause:** `http://localhost:3000` not in Authorized JavaScript origins  
**Fix:** Add to Google Console as shown in Step 2

### Error: "Invalid client"

**Cause:** Client ID mismatch  
**Fix:** Ensure `GOOGLE_CLIENT_ID` in `.env` matches Google Console

### Error: GSI button doesn't appear

**Cause:** GSI library not loading or client ID not set  
**Fix:**

1. Check Network tab for `gsi/client` script
2. Check Console for errors
3. Verify `/config` endpoint returns correct client ID

### Error: "Popup closed by user" (even when clicking Sign In)

**Cause:** Browser blocking third-party cookies  
**Fix:**

1. Enable cookies in browser
2. For production, use HTTPS
3. Check `SameSite` cookie policy

## Testing Checklist

- [ ] Google Cloud Console has Authorized JavaScript origins configured
- [ ] Backend server running on port 3000
- [ ] `/config` endpoint returns correct client ID
- [ ] GSI library loads in browser (check Network tab)
- [ ] No console errors about "Unauthorized origin"
- [ ] GSI button renders on signin page
- [ ] Clicking button opens Google popup
- [ ] After selecting account, receives JWT token
- [ ] Frontend sends token to `/api/v1/auth/google`
- [ ] Backend verifies token and returns app JWT
- [ ] User redirected to dashboard

## Quick Diagnostic Script

Add this to your signin.html temporarily to debug:

```html
<script>
  // Add before loading GSI library
  console.log("=== GSI Debug Info ===");

  // Check config endpoint
  fetch("/config")
    .then((r) => r.json())
    .then((cfg) => {
      console.log("Config from server:", cfg);
      console.log("Google Client ID:", cfg.googleClientId);
    })
    .catch((err) => console.error("Config fetch failed:", err));

  // Check when GSI loads
  window.addEventListener("load", () => {
    console.log("Google library loaded:", !!window.google);
    console.log("Google accounts API:", !!window.google?.accounts);
  });
</script>
```

## Alternative: Switch to OAuth 2.0 Redirect Flow

If GSI continues to fail, you can switch to the traditional OAuth 2.0 flow like your working implementation:

1. Use Passport.js with Google Strategy
2. Configure redirect URIs in Google Console
3. Implement server-side `/auth/google` and `/auth/google/callback` routes
4. Replace GSI buttons with regular "Sign in with Google" links

**Example:**

```javascript
// Backend with Passport
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    // Generate JWT and redirect to dashboard
    res.redirect("/profile");
  },
);
```

## Next Steps

1. ✅ Configure Google Cloud Console (Step 2 above)
2. ✅ Restart backend server
3. ✅ Test signin flow
4. ✅ Check browser console for errors
5. ✅ If still failing, add diagnostic script
6. ✅ Report specific error messages for further debugging
