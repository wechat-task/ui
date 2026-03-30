# WeChat Task UI - Initial Design

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS (monochrome + single accent color)
- React Router (client-side routing)
- @simplewebauthn/browser (Passkey auth)
- ky (API client with JWT injection)

## Pages

### `/` Landing
- Hero: "AI-Powered Task Management via WeChat"
- 3 feature cards: Passkey Login, Bot Management, AI-Driven Tasks
- "Get Started" CTA → `/login`

### `/login`
- Centered card, optional username field
- "Sign in with Passkey" button (browser native dialog)
- Auto-register new users, auto-login returning users
- On success → `/dashboard`

### `/dashboard`
- Top nav: app name + user menu
- "Add Bot" button
- Bot cards: name, status badge, description
- Empty state when no bots

### `/dashboard/bots/:id`
- Editable name + description
- Status indicator
- QR code (shown when pending, for ilink binding)
- Delete button

## Auth Flow
1. POST /auth/start → WebAuthn challenge
2. Browser Passkey dialog (fingerprint/face)
3. POST /auth/finish → JWT token
4. JWT stored in memory, injected via API interceptor
5. Protected routes redirect to /login if no token

## Color Palette
- Base: slate/gray, white background
- Accent: single blue (#2563eb)
- Status: gray (pending), green (active), red (disconnected)

## Project Structure
```
src/
  components/    # Button, Card, StatusBadge, Navbar
  pages/         # Landing, Login, Dashboard, BotDetail
  hooks/         # useAuth, useApi, useBots
  lib/           # api client, webauthn helpers, token store
  types/         # API types from swagger
```
