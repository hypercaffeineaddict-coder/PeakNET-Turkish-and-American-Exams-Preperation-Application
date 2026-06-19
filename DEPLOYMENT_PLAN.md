# YKS-App: Deployment Plan

This document outlines the step-by-step process for deploying the patched **YKS-App** to a production environment.

---

## 1. Prerequisites

Before starting the deployment, ensure you have access to the following services:

| Service | Purpose | Requirement |
| :--- | :--- | :--- |
| **Supabase** | Database, Auth, and Storage | Project URL and Anon Key |
| **Google AI** | Gemini API for AI Features | `GEMINI_API_KEY` |
| **Spotify** | Music Integration | `SPOTIFY_CLIENT_ID` |
| **Vercel** | Recommended Hosting Platform | Vercel Account & CLI |

---

## 2. Environment Variables

Create a `.env.production` file or set these variables in your hosting provider's dashboard:

### Database & Authentication (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Required for some server-side administrative tasks.

### AI Features (Google Gemini)
- `GEMINI_API_KEY`: Your API key from [Google AI Studio](https://aistudio.google.com/).

### Music Integration (Spotify)
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`: Your Client ID from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
- *Note: Ensure your redirect URI is set to `https://your-domain.com/muzik` in the Spotify dashboard.*

### Application Settings
- `NEXT_PUBLIC_SITE_URL`: The public URL of your deployed app (e.g., `https://peaknet.app`).

---

## 3. Database Setup (Supabase)

1. **Create Tables**: If not already present, ensure your Supabase database has the following tables:
   - `profiles`: User profile information.
   - `subjects`: Exam subjects (Math, Turkish, etc.).
   - `topics`: Specific study topics linked to subjects.
   - `topic_resources`: Links, files, and AI-generated tests.
   - `study_sessions`: Pomodoro and manual study logs.
   - `exams`: Mock exam results and net scores.
   - `mistakes`: Incorrectly answered questions for review.
   - `achievements`: User milestones and gamification data.

2. **Enable RLS**: Ensure Row Level Security (RLS) is enabled for all tables to protect user data.

3. **Storage Buckets**: Create a bucket named `resources` for user-uploaded study materials.

---

## 4. Hosting Recommendation: Vercel

Vercel is the recommended platform for Next.js applications due to its native support for Turbopack and Edge Functions.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login and Initialize
```bash
vercel login
vercel link
```

### Step 3: Configure Environment Variables
Use the Vercel dashboard or CLI to add all variables listed in Section 2.

### Step 4: Deploy
```bash
vercel --prod
```

---

## 5. Post-Deployment Verification

After the deployment is successful, perform the following checks:

1. **Authentication**: Sign up as a new user and verify the onboarding flow.
2. **AI Tools**: Test the Drawing Board (`/tahta`) and Weekly Coach (`/rapor`) to ensure Gemini API is connected.
3. **Language Practice**: Test the microphone input in the language chat (`/diller/[lang]`).
4. **Music**: Connect a Spotify account and verify track search and playback.
5. **Statistics**: Log a 1-minute Pomodoro session and check if the heatmap updates.
6. **Mobile Nav**: Verify the bottom navigation bar works correctly on mobile devices.

---

## 6. Troubleshooting

- **Build Failures**: Ensure `lightningcss` is installed as an optional dependency (fixed in the patch).
- **AI Errors**: Check if `GEMINI_API_KEY` is valid and has sufficient quota.
- **Auth Redirects**: Verify that the `SITE_URL` matches your deployment domain in Supabase Auth settings.
- **Spotify 401**: Ensure the Client ID is correct and the redirect URI is exactly as configured in the Spotify dashboard.

---

**Plan Prepared by**: Manus AI  
**Project Version**: Patched Build (June 2026)
