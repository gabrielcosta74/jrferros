<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7c56b636-5874-45e8-b32e-678c46e8f80b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production

This app is deployed as one Node service. Build the Vite frontend, then start the Express server:

```bash
npm run build
npm start
```

In production the Express server serves both the API routes under `/api/*` and the built frontend from `dist/`, so there is no separate Vite proxy process.

## Vercel

The Vercel deployment uses `vercel.json`: `/api/*` is handled by the Express app through `api/index.ts`, while the frontend is served from the Vite `dist/` build.

Set these environment variables in Vercel before deploying:

- `SUPABASE_PROJECT_ID`
- `SUPABASE_URL` (optional if `SUPABASE_PROJECT_ID` is set)
- `SUPABASE_SERVICE_ROLE`
- `SUPABASE_MEDIA_BUCKET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `GEMINI_API_KEY` if Gemini features are enabled
