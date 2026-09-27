# ChatIQ Setup and Deployment Notes

This guide matches the current repository. The application has a FastAPI backend, a Vite React frontend, Supabase PostgreSQL/Storage, and Groq for translation and summaries. Docker, CI/CD, Redis, queues, and managed workers are not included.

## Requirements

- Python 3.11+
- Node.js and npm
- Supabase project with PostgreSQL and Storage
- Groq API key for AI translation and summaries

## 1. Supabase

Create a Supabase project and run these files in order in the SQL editor:

```text
backend/db/migrations/001_create_users.sql
backend/db/migrations/002_create_chats.sql
backend/db/migrations/003_create_chat_members.sql
backend/db/migrations/004_create_messages.sql
backend/db/migrations/005_create_reactions.sql
backend/db/migrations/006_create_stickers.sql
backend/db/migrations/007_create_attachments.sql
backend/db/migrations/008_create_room_summaries.sql
```

The current `002_create_chats.sql` accepts `chatroom`, `private`, and `group`. If an older database already exists, apply `backend/db/migration_add_group.sql` to update its check constraint.

Create a public Storage bucket named `media`. The upload service stores objects under `<user_id>/<uuid>.<extension>` and returns public URLs. Run the sticker seeder after the schema is ready:

```bash
cd backend
python db/seed_stickers.py
```

`backend/db/setup_database.sql` is a legacy one-shot script and does not include the current permanent-group constraint. Prefer the ordered migrations.

## 2. Backend

PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Bash:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set these values in `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
```

`core/database.py` creates the backend client with `SUPABASE_SERVICE_ROLE_KEY`. Keep it server-side and never expose it through Vite variables.

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

Health and API docs:

```text
http://localhost:8000/
http://localhost:8000/docs
http://localhost:8000/openapi.json
```

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

For PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Local frontend variables:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

The Vite server normally uses port 5173. If occupied, use the port printed by Vite. Build validation:

```bash
npm run build
```

## 4. Runtime flow

1. Register or log in through the frontend.
2. The frontend stores the JWT in localStorage under `chatiq_token`.
3. Axios sends the token as `Authorization: Bearer <token>`.
4. The active chat opens `/api/ws/chatroom/{id}` or `/api/ws/private/{id}` with the token query parameter.
5. The backend verifies the token and chat membership before accepting the socket.
6. Uploaded files are sent to `/api/upload`, then their returned metadata is included in a message.

## 5. Useful API smoke checks

```bash
# Health
curl http://localhost:8000/

# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret"}'

# Authenticated request
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer <access-token>"
```

Use Swagger at `/docs` for the complete registered route list and request schemas.

## 6. Verification

Backend syntax:

```bash
cd backend
python -m compileall -q .
```

Frontend TypeScript and production build:

```bash
cd frontend
npm run build
```

The repository does not currently contain pytest, frontend unit tests, browser E2E tests, load tests, or a CI workflow. Manual WebSocket examples exist in `backend/ws_test.py` and `backend/ws_test_close.py`, but they are fixture scripts rather than a complete automated suite.

## 7. Deployment notes

A host such as Render or Railway can run the backend with:

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

A static frontend host such as Vercel or Netlify can run:

```bash
npm install
npm run build
```

Set production frontend variables to the deployed origins, for example:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_WS_BASE_URL=wss://api.example.com
```

Before exposing the service publicly:

- restrict `allow_origins` in `backend/main.py` from `*` to known frontend origins;
- keep Supabase service-role and Groq keys in host secret storage;
- use HTTPS/WSS;
- configure a public `media` bucket deliberately or replace public URLs with signed URLs;
- add rate limits, upload quotas/scanning, structured logs, metrics, health checks, backups, and centralized error reporting;
- replace the process-local WebSocket manager before running multiple backend instances;
- move polling tasks to a single durable worker or scheduled job to avoid duplicate work.

## 8. Troubleshooting

### Port 8000 is already in use

Find and stop the existing Uvicorn process, then start one backend instance. On Windows, the old process may belong to another VS Code terminal. Closing that terminal or restarting the process owner may be necessary.

### WebSocket closes with 4001

The token is missing, expired, signed with a different secret, or uses a different algorithm.

### WebSocket closes with 4003

The authenticated user is not a member of the requested chat.

### Upload succeeds but media is missing after refresh

Confirm that the later message request includes the returned attachment metadata and that migration 007 and the `media` bucket exist. Uploading a file alone does not create a message.

### Translation or summary returns 500

Confirm `GROQ_API_KEY` exists and `GROQ_MODEL` is available to the account. AI output is plain text and is not schema-validated.

### Search returns no result

Current search is a case-insensitive `ILIKE` substring query scoped to a chat. It does not currently use the generated `tsvector`/GIN index or relevance ranking.
