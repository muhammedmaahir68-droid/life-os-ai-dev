# LifeOS AI

A personal control panel with a real AI agent: Dashboard, Career Engine, Life OS,
Cloud Center, and an AI Assistant that reads your actual saved data before answering.

- **Auth:** Sign in with GitHub (OAuth) — no passwords stored, ever.
- **Database:** MongoDB (real persistence, not localStorage).
- **AI:** Claude API, grounded in your own entries.
- **Cost:** Hosting is $0/month on the stack below. The AI Assistant calls the
  Anthropic API, which is pay-per-use (a personal project like this typically
  runs a few cents to a couple of dollars a month, not literally free — there's
  no way around that if you want a real model answering, not a canned response).

---

## 1. Run it locally in VS Code

**Requirements:** Node.js 18+, a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account, a free [GitHub OAuth App](https://github.com/settings/developers), and an [Anthropic API key](https://console.anthropic.com).

```bash
# Backend
cd backend
cp .env.example .env    # fill in the values, see step 2 below
npm install
npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Open `http://localhost:5173` — you should land on the login screen.

## 2. Set up the three free services

**MongoDB Atlas (free M0 cluster)**
1. Create a free cluster at Atlas → Database → Build a Database → M0 (free forever).
2. Database Access → add a user + password.
3. Network Access → allow access from anywhere (`0.0.0.0/0`) for now.
4. Copy the connection string into `MONGODB_URI` in `backend/.env`.

**GitHub OAuth App (free)**
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: `http://localhost:5173` (change to your real domain later).
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`.
4. Copy the Client ID and Client Secret into `backend/.env`.

**Anthropic API key**
1. Create a key at console.anthropic.com → put it in `ANTHROPIC_API_KEY`.

## 3. Deploy for free (Vercel + Render + Atlas)

| Piece | Service | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Import the `frontend` folder as a project. Free tier, auto SSL. |
| Backend | [Render](https://render.com) | New Web Service → point at the `backend` folder → free tier. |
| Database | MongoDB Atlas | Already set up above. |

Steps:
1. Push this project to a **public or private** GitHub repo.
2. On Render: New → Web Service → connect the repo → root directory `backend` → build command `npm install` → start command `npm start`. Add all the `backend/.env` variables in Render's Environment tab. Once deployed, copy the Render URL.
3. Update `GITHUB_CALLBACK_URL` in Render's env vars to `https://<your-render-app>.onrender.com/api/auth/github/callback`, and update that same callback URL in your GitHub OAuth App settings.
4. On Vercel: New Project → connect the repo → root directory `frontend` → add env var `VITE_API_URL=https://<your-render-app>.onrender.com` → deploy.
5. Back in Render, set `CLIENT_URL` to your Vercel URL, and in your GitHub OAuth App set Homepage URL to the Vercel URL too.

**Free-tier caveat:** Render's free web service sleeps after ~15 minutes idle; the
first request after that takes ~30–50s to wake up. Fine for personal/portfolio use.
To keep it warm, point a free uptime pinger (e.g. UptimeRobot) at
`https://<your-render-app>.onrender.com/api/health` every 10 minutes. For a true
always-on server, Render's cheapest paid tier (~$7/mo) removes the sleep.

## 4. If you specifically want AWS EC2 instead

This whole stack also runs fine on a single EC2 instance (Node + PM2 + nginx +
your own MongoDB or Atlas). It's more setup and isn't free (EC2's free tier is
750 hrs/month for 12 months only, then it bills). Since I can't reach AWS's API
from this sandbox, that path has to run from your own machine with your AWS CLI —
say the word and I'll write the exact EC2 launch runbook (security groups, nginx
config, PM2/systemd service, SSL via Let's Encrypt) to go with this same code.

## Project structure

```
life-os-ai/
  backend/    Express API — auth, entries, AI chat
  frontend/   React (Vite) — Dashboard, Career Engine, Life OS, Cloud Center, AI Assistant
```
