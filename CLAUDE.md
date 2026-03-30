# WeChat Task UI

## Overview
AI-powered task management system UI, built with React + TypeScript + Vite + Tailwind CSS. Users authenticate via Passkey (WebAuthn) and manage WeChat bots through iLink protocol.

## Tech Stack
- React 19, TypeScript, Vite 8
- Tailwind CSS 4 (via @tailwindcss/vite)
- React Router 7
- @simplewebauthn/browser
- ky (HTTP client)

## Commands
- `npm run dev` - Start dev server (proxies /api to localhost:8080)
- `npm run build` - Production build
- `npx tsc --noEmit` - Type check

## Project Structure
- `src/components/` - Shared UI components (Button, Card, StatusBadge, Navbar, ProtectedRoute)
- `src/pages/` - Route pages (Landing, Login, Dashboard, BotDetail)
- `src/lib/` - API client, auth helpers, token management
- `src/types/` - TypeScript types from swagger API spec

## API
- Backend: Go server on localhost:8080
- Swagger spec: `/Users/ququzone/Develop/projects/wechat-task/api/docs/swagger.json`
- Auth: JWT Bearer tokens via Passkey (WebAuthn)

## Style Guidelines
- Clean, minimal design - monochrome slate/gray with single accent
- Tailwind utility classes only, no custom CSS
- Status colors: gray (pending), green (active), red (disconnected)
