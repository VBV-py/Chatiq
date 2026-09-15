# ChatIQ Deployment Setup (Step-by-Step)

This guide deploys:

- Backend: FastAPI (WebSocket + REST)
- Frontend: Vite React static build
- Database/Storage: Supabase
- AI: Groq

## 1. Prerequisites

Install locally:

- Python 3.11+
- Node.js 18+
- Git

Create accounts:

- Supabase
- Groq
- One backend host: Render or Railway
- One frontend host: Vercel or Netlify

## 2. Prepare Repository

1. Push this project to GitHub.
2. Ensure these files exist and are updated:

- `backend/.env.example`
- `frontend/.env.example`
- `.env.example`

## 3. Supabase Setup

1. Create a new Supabase project.
2. Open SQL Editor and run migrations in order:

- `backend/db/migrations/001_create_users.sql`
- `backend/db/migrations/002_create_chats.sql`
- `backend/db/migrations/003_create_chat_members.sql`
- `backend/db/migrations/004_create_messages.sql`
- `backend/db/migrations/005_create_reactions.sql`
- `backend/db/migrations/006_create_stickers.sql`
- `backend/db/migrations/007_create_attachments.sql`
- `backend/db/migrations/008_create_room_summaries.sql`

3. Create a public storage bucket named `media`.
4. Collect keys from Supabase project settings:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Groq Setup

1. Create a Groq API key.
2. Choose a model (current default):

- `llama-3.3-70b-versatile`

## 5. Backend Deployment (Render example)

### 5.1 Create Service

1. New Web Service from GitHub repo.
2. Root directory: `backend`
3. Runtime: Python
4. Build command:

```bash
pip install -r requirements.txt
```

5. Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 5.2 Add Backend Environment Variables

Set in host dashboard:

```env
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_ALGORITHM=HS256
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
```

### 5.3 Backend Health Check

After deploy, open:

- `https://your-backend-domain/`

Expected response includes `ChatIQ API is running`.

## 6. Frontend Deployment (Vercel example)

### 6.1 Create Project

1. Import GitHub repo.
2. Root directory: `frontend`
3. Build command:

```bash
npm install ; npm run build
```

4. Output directory:

- `dist`

### 6.2 Add Frontend Environment Variables

```env
VITE_API_BASE_URL=https://your-backend-domain
VITE_WS_BASE_URL=wss://your-backend-domain
```

Important:

- Use `wss://` in production for WebSocket.

## 7. CORS and Security Hardening (Required for Production)

Current backend CORS is open (`allow_origins=["*"]`). Restrict it before production.

Recommended backend update in `backend/main.py`:

- Set `allow_origins` to your real frontend domains only.

Example:

```python
allow_origins=[
	"https://your-frontend-domain",
	"https://www.your-frontend-domain",
]
```

## 8. Local Pre-Deploy Verification

Run these before pushing:

### Backend

```bash
cd backend
python -m compileall .
```

### Frontend

```bash
cd frontend
npm run build
```

Note:

- If frontend build fails, fix TypeScript errors first.

## 9. Post-Deploy Smoke Test

Test in production URL:

1. Register user A and user B.
2. Create chatroom and private chat.
3. Send text message.
4. Upload image, video, and PDF.
5. Refresh page and confirm media persists.
6. Test translation endpoint from UI.
7. Check WebSocket events (typing, message receive, reactions).

## 10. Troubleshooting

### WebSocket not connecting

- Ensure `VITE_WS_BASE_URL` uses `wss://` and correct backend domain.
- Check backend logs for close code `4001` (token issue).

### Upload works but media disappears after refresh

- Confirm backend is running latest code that saves attachments.
- Confirm `attachments` table exists and migration `007` was applied.

### AI translation fails

- Verify `GROQ_API_KEY` is set in backend host.
- Verify selected `GROQ_MODEL` is available on your Groq account.

### 401 errors

- Check JWT vars and frontend token storage.
- Re-login to refresh token.

## 11. Optional: Single-Command Local Start

Backend terminal:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Frontend terminal:

```bash
cd frontend
npm run dev
```

## 12. Deployment Checklist

- [ ] Supabase migrations applied
- [ ] Supabase `media` bucket created
- [ ] Backend env vars configured
- [ ] Frontend env vars configured
- [ ] Backend deploy healthy
- [ ] Frontend deploy healthy
- [ ] CORS restricted to frontend domains
- [ ] WebSocket works over `wss://`
- [ ] Media upload + refresh persistence verified
- [ ] Groq translation verified
