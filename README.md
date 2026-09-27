# ChatIQ

ChatIQ is a React + FastAPI real-time chat application backed by Supabase PostgreSQL and Supabase Storage. It supports temporary chatrooms, permanent groups, one-to-one private chats, JWT authentication, WebSocket messaging, media attachments, reactions, stickers, search, Groq-powered translation, AI room summaries, and private-chat auto-reset.

This document describes the implementation currently present in the repository. It does not claim infrastructure that is not included, such as Docker, CI/CD, Redis, queues, vector search, or automated tests.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Local Setup](#local-setup)
- [Configuration](#configuration)
- [HTTP API](#http-api)
- [WebSocket API](#websocket-api)
- [Data Model](#data-model)
- [Runtime Behavior](#runtime-behavior)
- [Security and Error Handling](#security-and-error-handling)
- [AI and Search](#ai-and-search)
- [Deployment Reality](#deployment-reality)
- [Testing and Known Gaps](#testing-and-known-gaps)

## Features

### Authentication and profile

- Register with a unique username and email.
- Login with email and password.
- Passwords are hashed with `bcrypt`.
- Access tokens are custom JWTs with a seven-day expiration.
- The frontend persists the token and user in browser `localStorage`.
- Users can update their preferred translation language.

### Chat types

- **Temporary chatroom**: named multi-user room. The creator is the admin. Admins can invite/remove members and delete the room. A background watcher deletes a temporary room when every member is offline and no WebSocket is connected.
- **Permanent group**: the same room model with `type = group`; it is not selected by the expiry watcher.
- **Private chat**: one-to-one persistent chat. Creating a chat with the same pair reuses an existing private chat when one exists.

### Messaging

- Text, image, video, audio, file, and sticker message types are represented in the database.
- Text messages can be edited by their sender.
- Messages can be soft-deleted by setting `deleted = true` and clearing content.
- Messages can be copied through the browser clipboard, forwarded, and reacted to.
- Uploaded files are stored in Supabase Storage and linked through the `attachments` table.
- WebSocket messages are queued in the frontend while a socket is connecting or reconnecting.

### Realtime behavior

The frontend opens one WebSocket for the active chat. The backend authenticates the token from the query string, verifies membership, tracks online state, and broadcasts events through an in-process `ConnectionManager`. Supported message actions include sending, editing, deleting, forwarding, stickers, reactions, and typing indicators.

### AI and search

- Translation calls Groq using the configured model, defaulting to `llama-3.3-70b-versatile`.
- Temporary-room summaries call the same Groq integration and are stored in `room_summaries` before the room is deleted.
- Summaries are also posted to a private chat with the `Chatty` bot user.
- Search is scoped to a chat and currently uses a case-insensitive `ILIKE` query. The database also defines a generated English `tsvector` and GIN index, but the current search service does not use that index.

## Architecture

```text
React/Vite browser
  | Axios REST requests with Authorization: Bearer <JWT>
  | WebSocket /api/ws/{chat-type}/{chat-id}?token=<JWT>
  v
FastAPI application
  | routers: auth, chatrooms, private_chats, messages, media, reactions, stickers, ai
  | services: business rules and Supabase calls
  | ws_core: connection manager and event dispatcher
  | lifespan tasks: expiry watcher and auto-reset scheduler
  v
Supabase
  | PostgreSQL tables, constraints, generated search column, indexes
  | Storage bucket: media
  v
Groq API
  | translation and room-summary text generation
```

`backend/main.py` creates the FastAPI app, enables permissive CORS, registers routers under `/api`, and starts the two polling tasks during the application lifespan. There is no message broker or shared WebSocket layer; each backend process owns its own active connections.

## Repository Structure

```text
.
├── README.md
├── setup.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── core/                 # config, Supabase client, JWT, auth dependency
│   ├── models/               # Pydantic request/response models
│   ├── routers/              # HTTP and WebSocket route handlers
│   ├── services/             # database and business operations
│   ├── ws_core/              # WebSocket events, manager, dispatcher
│   ├── tasks/                # expiry and auto-reset polling loops
│   └── db/
│       ├── migrations/       # ordered SQL migrations
│       ├── setup_database.sql # legacy one-shot setup script
│       └── migration_add_group.sql
└── frontend/
    ├── package.json
    ├── .env.example
    ├── public/stickers/      # bundled sticker assets
    └── src/
        ├── api/              # Axios endpoint wrappers
        ├── components/       # chat, auth, dashboard, shared UI
        ├── hooks/             # auth, chat, message, socket, search hooks
        ├── pages/             # login, register, dashboard, chat, settings
        ├── socket/            # WebSocket client and event names
        ├── store/             # Zustand auth/chat/message/UI state
        ├── types/             # TypeScript domain types
        └── utils/             # constants and formatting helpers
```

Important implementation files:

- [backend/main.py](backend/main.py): app wiring and background tasks.
- [backend/core/security.py](backend/core/security.py): bcrypt and JWT operations.
- [backend/core/dependencies.py](backend/core/dependencies.py): HTTP bearer authentication.
- [backend/services/message_service.py](backend/services/message_service.py): message CRUD, forwarding, history, and attachment persistence.
- [backend/ws_core/handler.py](backend/ws_core/handler.py): client event dispatcher.
- [backend/ws_core/manager.py](backend/ws_core/manager.py): in-process connection registry and broadcasts.
- [frontend/src/hooks/useSocket.ts](frontend/src/hooks/useSocket.ts): active-chat subscriptions and store updates.
- [frontend/src/socket/socketClient.ts](frontend/src/socket/socketClient.ts): reconnecting browser WebSocket client.

## Local Setup

### Prerequisites

- Python 3.11 or newer.
- Node.js and npm.
- A Supabase project with PostgreSQL and a Storage bucket.
- A Groq API key for translation and summaries.

### Backend

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

Fill in `backend/.env`, apply the SQL migrations in order through the Supabase SQL editor, create a public Storage bucket named `media`, and seed stickers:

```bash
python db/seed_stickers.py
uvicorn main:app --reload --port 8000
```

The API health response is available at `http://localhost:8000/`; FastAPI documentation is at `http://localhost:8000/docs`.

For an existing database created before permanent groups were added, apply `backend/db/migration_add_group.sql`. The ordered migration `002_create_chats.sql` now includes `group`; the older `setup_database.sql` one-shot script still has the old chat-type constraint and should not be treated as the current source of truth.

### Frontend

```bash
cd frontend
npm install
Copy-Item .env.example .env       # PowerShell
npm run dev
```

The Vite development server normally starts at `http://localhost:5173`. If that port is busy, Vite chooses another port and prints it. The frontend production check is:

```bash
npm run build
```

## Configuration

### Backend variables

Defined by `backend/core/config.py` and `backend/.env.example`:

| Variable                      | Required      | Purpose                                                       |
| ----------------------------- | ------------- | ------------------------------------------------------------- |
| `SUPABASE_URL`              | Yes           | Supabase project URL                                          |
| `SUPABASE_KEY`              | Yes           | Configured but not used by`core/database.py` for the client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes           | Server-side Supabase client key                               |
| `JWT_SECRET`                | Yes           | Signs and verifies custom JWTs                                |
| `JWT_ALGORITHM`             | No            | JWT algorithm; defaults to`HS256`                           |
| `CORS_ORIGINS`              | No            | Comma-separated frontend origins; defaults to`*`            |
| `GROQ_API_KEY`              | No at startup | Required when translation or summaries are invoked            |
| `GROQ_MODEL`                | No            | Groq model; defaults to`llama-3.3-70b-versatile`            |

The service-role key is used by the backend and must never be exposed to the browser.

### Frontend variables

Defined in `frontend/src/utils/constants.ts`:

| Variable              | Default                   | Purpose          |
| --------------------- | ------------------------- | ---------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | API origin       |
| `VITE_WS_BASE_URL`  | `ws://localhost:8000`   | WebSocket origin |

`frontend/.env` is local-only and ignored by Git. Production HTTPS deployments should use an HTTPS API URL and `wss://` WebSocket URL.

## HTTP API

All HTTP routes below are prefixed with `/api`. Except registration and login, they require:

```http
Authorization: Bearer <access_token>
```

FastAPI also exposes the generated OpenAPI document at `/openapi.json` and Swagger UI at `/docs`.

### Authentication

#### `POST /api/register`

Body:

```json
{"username":"alice","email":"alice@example.com","password":"secret"}
```

Returns `TokenResponse`:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": "<uuid>",
    "username": "alice",
    "email": "alice@example.com",
    "preferred_language": "en",
    "created_at": "<timestamp>"
  }
}
```

Possible service errors include `400` for duplicate username/email and `500` for an unsuccessful insert. Pydantic validates the email format.

#### `POST /api/login`

Body: `{"email":"alice@example.com","password":"secret"}`. Returns the same token response. Invalid or unknown credentials return `401`.

#### `POST /api/logout`

Requires a valid bearer token. Returns `{"message":"Logged out successfully"}`. Logout is stateless on the server; the frontend removes its local token.

#### `GET /api/me`

Returns the authenticated `UserOut` record. Missing, expired, or invalid credentials return `401`; a missing database user returns `404`.

#### `PATCH /api/me/language`

Body: `{"preferred_language":"es"}`. Returns the updated `UserOut`. The language is stored as an unrestricted string; the frontend supplies a fixed list of language codes.

### Chatrooms and groups

#### `POST /api/chatrooms`

Body: `{"name":"Study Group","chat_type":"chatroom"}`. `chat_type` defaults to `chatroom`; service code accepts `chatroom` and `group`. The creator is inserted into `chat_members` and marked online. Returns `ChatOut`.

#### `GET /api/chatrooms`

Returns the authenticated user's memberships for chats whose type is `chatroom` or `group`.

#### `GET /api/chatrooms/{chat_id}`

Returns chat metadata for a chatroom/group. The route requires authentication, while message/member operations enforce membership.

#### `POST /api/chatrooms/{chat_id}/invite`

Body: `{"username":"bob"}`. Only `admin_id` can invite. Returns the inserted membership. Common errors: `403` non-admin, `404` room/user missing, `400` already a member.

#### `POST /api/chatrooms/{chat_id}/join`

Adds the current user if absent, or marks an existing membership online. Returns a status or membership row.

#### `DELETE /api/chatrooms/{chat_id}/members/{user_id}`

Only the room admin can remove another member; the admin cannot remove themselves. Returns `{"message":"Member removed"}`.

#### `GET /api/chatrooms/{chat_id}/members`

Returns member rows with `user_id`, `username`, `is_online`, and `joined_at`.

#### `GET /api/chatrooms/{chat_id}/messages?limit=50&offset=0`

Returns ordered message history with sender username, reactions, and attachments. Membership is required.

#### `GET /api/chatrooms/{chat_id}/search?q=hello`

Returns non-deleted messages in the chat whose content contains the query, case-insensitively. Membership is checked; non-members receive an empty result from the search service.

#### `DELETE /api/chatrooms/{chat_id}/messages`

Deletes all messages in the chat after membership validation. Returns `{"message":"Chat cleared successfully"}`.

#### `POST /api/chatrooms/{chat_id}/summarize`

Generates a Groq summary, stores a `room_summaries` row, creates/posts a summary in each member's private chat with `Chatty`, broadcasts those private-chat messages, and returns `{"message":"Summaries sent"}`. Groq configuration or database failures surface as server errors.

#### `DELETE /api/chatrooms/{chat_id}`

Only the admin can delete. The service attempts a summary first, removes stored attachment objects, and deletes the chat. Chat deletion cascades to members/messages/reactions/attachments at the database level. The summary row is deliberately not FK-linked to `chats`, so it can survive deletion.

### Private chats

#### `POST /api/private-chats?target_username=bob`

The target username is a query parameter. The service finds or creates a private chat containing the two users. Missing target users return `404`.

#### `GET /api/private-chats`

Returns the current user's private chats with nested member usernames and presence data.

#### `GET /api/private-chats/{chat_id}/messages?limit=50&offset=0`

Returns ordered history with reactions and attachments. Membership is required.

#### `GET /api/private-chats/{chat_id}/search?q=hello`

Per-chat case-insensitive content search. Membership is required by the search service.

#### `DELETE /api/private-chats/{chat_id}`

Any member can delete the private chat. Database cascades remove its dependent rows.

#### `DELETE /api/private-chats/{chat_id}/messages`

Clears all messages for a member.

#### Auto-reset endpoints

- `POST /api/private-chats/{chat_id}/auto-reset/propose`: adds the caller to `auto_reset_accepted_by`.
- `POST /api/private-chats/{chat_id}/auto-reset/accept`: adds the caller and enables reset when every member is present in the accepted list.
- `POST /api/private-chats/{chat_id}/auto-reset/disable`: clears acceptance and disables reset.

All validate membership. The scheduler checks enabled private chats every 60 seconds and deletes messages once `last_reset_at` is at least 24 hours old.

### Messages and reactions

#### `POST /api/messages`

Body example:

```json
{
  "chat_id":"<uuid>",
  "content":"Hello",
  "message_type":"text",
  "sticker_id":null,
  "forwarded_from":null,
  "attachments":[]
}
```

The sender must be a member. Attachment inputs contain `file_url`, `file_name`, optional `file_size`, and optional `mime_type`. Returns the inserted message plus created attachment rows.

#### `PUT /api/messages/{message_id}`

Body: `{"content":"Edited text"}`. Only the sender of a `text` message can edit. Media/stickers return `400`; another sender returns `403`.

#### `DELETE /api/messages/{message_id}`

Soft-deletes the message and removes attachment objects from Storage when possible. Normally only the sender can delete. AI summary messages have a special membership-based delete rule.

#### `POST /api/messages/{message_id}/forward`

Body: `{"target_chat_id":"<uuid>"}`. The destination membership is validated by `send_message`; content, type, sticker ID, and attachment metadata are copied and `forwarded_from` references the source message.

#### Reactions

- `POST /api/messages/{message_id}/reactions`, body `{"emoji":"👍"}`. Only eight emojis are allowed: `👍`, `❤️`, `😂`, `😮`, `😢`, `🔥`, `🎉`, `👏`.
- `DELETE /api/messages/{message_id}/reactions/{emoji}` removes the caller's reaction.
- `GET /api/messages/{message_id}/reactions` returns reactions with usernames.

Duplicate reactions return `400`. The route itself does not separately verify chat membership; the database reaction operation is keyed by message/user.

### Media and stickers

#### `POST /api/upload`

Multipart form field: `file`. The server reads the complete file, rejects files over 100 MiB with `413`, uploads to the `media` bucket under `<uploader_id>/<uuid>.<extension>`, and returns:

```json
{"file_url":"<public-url>","file_name":"photo.png","file_size":12345,"mime_type":"image/png"}
```

The upload endpoint does not itself create a message; the client sends the returned metadata in a subsequent message.

#### `GET /api/stickers`

Returns stickers ordered by `display_order`. Sticker rows are seeded by `backend/db/seed_stickers.py`; bundled frontend images live under `frontend/public/stickers`.

### AI translation

#### `POST /api/ai/translate`

Body:

```json
{"content":"Hello world","target_language":"Spanish","model":null}
```

If `target_language` is omitted, the user's stored preferred language is used. The service constructs a translation prompt and calls Groq. Returns `original`, `translated`, `language`, and `model`. If `GROQ_API_KEY` is missing, the endpoint returns `500` with `Groq API key is not configured.`.

## WebSocket API

Endpoints:

```text
ws://localhost:8000/api/ws/chatroom/{chat_id}?token=<jwt>
ws://localhost:8000/api/ws/private/{chat_id}?token=<jwt>
```

The token is decoded with the same JWT settings as HTTP. Invalid tokens close with code `4001`; authenticated non-members close with code `4003`. A successful connection marks the member online and broadcasts `user_online`; disconnecting marks the member offline and broadcasts `user_offline`.

Messages use this envelope:

```json
{"event":"send_message","data":{"content":"Hello","message_type":"text"}}
```

### Implemented client-to-server events

| Event               | Data                                                                    | Behavior                                                               |
| ------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `send_message`    | `content`, `message_type`, optional `sticker_id`, `attachments` | Persists and broadcasts a message                                      |
| `send_sticker`    | `sticker_id`, `content`                                             | Persists a sticker message and broadcasts it                           |
| `edit_message`    | `message_id`, `content`                                             | Edits the caller's text message and broadcasts it                      |
| `delete_message`  | `message_id`                                                          | Soft-deletes and broadcasts deletion                                   |
| `add_reaction`    | `message_id`, `emoji`                                               | Validates and broadcasts a reaction                                    |
| `remove_reaction` | `message_id`, `emoji`                                               | Removes and broadcasts reaction removal                                |
| `typing`          | any object                                                              | Broadcasts typing to other connections                                 |
| `stop_typing`     | any object                                                              | Broadcasts typing stop to other connections                            |
| `forward_message` | `message_id`, `target_chat_id`                                      | Persists a forwarded message and broadcasts to destination connections |

`join_room` and `leave_room` are declared constants but are not dispatched by `ws_core/handler.py`; the route already connects to the requested chat.

### Server events used by the implementation

- `receive_message`: new message or summary message.
- `message_edited`: edited message data.
- `message_deleted`: `{message_id}`.
- `reaction_added`: reaction with username added by the handler.
- `reaction_removed`: message/user/emoji identifiers.
- `typing`, `stop_typing`: user ID and username.
- `user_online`, `user_offline`: presence payloads.
- `chat_reset`: emitted by the auto-reset scheduler.
- `error`: sent to the originating socket when a handled message action fails.

Additional names such as `room_expired`, `ai_summary_ready`, and `message_translated` exist in `ws_core/events.py`, but the current server paths do not consistently emit them.

## Data Model

The migrations define eight main tables:

- `users`: UUID primary key, unique username/email, bcrypt hash, preferred language, creation time.
- `chats`: UUID primary key, `type` constrained to `chatroom`, `private`, or `group`; optional room name/admin; auto-reset fields.
- `chat_members`: many-to-many join between users and chats, unique per pair, online state, joined time. Cascades on user/chat deletion.
- `messages`: chat/sender references, sender type, content, message type, sticker ID, edit/delete flags, self-reference for forwarding, timestamp. The `chat_id` FK cascades from chats; `sender_id` does not specify cascade.
- `reactions`: message/user/emoji rows with a unique `(message_id, user_id, emoji)` constraint and cascades from message/user deletion.
- `stickers`: pack metadata and display ordering. `sticker_id` on messages is not declared as a foreign key in the migration.
- `attachments`: one or more file records per message with Storage URL and metadata; cascades from message deletion.
- `room_summaries`: durable summary snapshot. `chat_id` intentionally has no FK, allowing summaries to remain after room deletion.

Indexes:

- `messages_chat_id_idx` supports chat history filtering.
- `messages_search_idx` is a GIN index over a generated English `tsvector`.
- Username/email uniqueness and the chat-membership uniqueness constraint also provide database indexes through PostgreSQL constraints.

The services issue multiple Supabase REST calls sequentially. There are no explicit database transactions in application code, no stored procedures, and no distributed transaction coordinator. Partial state is therefore possible if a later call fails after an earlier insert/update succeeds.

## Runtime Behavior

### Sending a text message

1. The active `ChatroomPage` or `PrivateChatPage` calls `useSocket().send`.
2. `socketClient` serializes `{event,data}`. If the socket is not open, it queues up to 100 events.
3. The WebSocket router authenticates and passes the raw payload to `ws_core.handler.handle_event`.
4. `message_service.send_message` checks `chat_members`, inserts into `messages`, and optionally inserts attachment rows.
5. The handler enriches the message with sender username and broadcasts `receive_message` through the in-process manager.
6. `useSocket` writes the event into Zustand's `messageStore`, and `MessageList` renders it.

### Uploading media

1. `MessageInput` sends the file as multipart data to `/api/upload`.
2. `media_service` reads and uploads it to the public `media` bucket.
3. The returned URL and metadata are sent in a WebSocket `send_message` payload.
4. `message_service` inserts the message and attachment rows.
5. History queries join attachments so media survives refresh.

### Temporary-room expiry

1. Each successful WebSocket connect/disconnect updates `chat_members.is_online`.
2. `expiry_watcher` waits five seconds at startup, then polls every 30 seconds.
3. It selects `type = chatroom`, checks every member's `is_online` value and whether the in-process manager has connections.
4. It generates a summary with `trigger = expiry`, broadcasts summary messages to private chats, and deletes room data.
5. Permanent `group` records are not selected by this watcher.

### Private-chat auto-reset

1. Each user calls propose/accept. Accepted IDs are stored in an array on `chats`.
2. Reset becomes enabled when all current member IDs are accepted.
3. The scheduler polls enabled private chats every 60 seconds.
4. Once 24 hours have elapsed since `last_reset_at`, it deletes messages, updates the timestamp, and broadcasts `chat_reset`.

## Security and Error Handling

Implemented controls:

- Password hashing and verification use bcrypt.
- JWTs are signed with a configurable secret and algorithm and contain `sub`, `username`, `iat`, and `exp`.
- HTTP routes use `HTTPBearer`; invalid/expired tokens return `401`.
- WebSockets validate token and membership before accepting.
- Message edit/delete rules are enforced in the service layer.
- Chatroom invite/remove/delete rules enforce the room admin.
- File size is capped at 100 MiB.
- Reaction emojis are restricted to an allow-list.
- Pydantic validates request shapes and email format.
- FastAPI HTTP exceptions provide most expected error responses; storage, Groq, and Supabase failures are generally converted to `500` or printed by background tasks.

Current hardening gaps:

- CORS defaults to every origin for development; production should set `CORS_ORIGINS` to the exact frontend origin or comma-separated origins.
- The service-role Supabase key is powerful; database RLS policy design is not represented in this repository.
- There is no rate limiting, account lockout, refresh-token rotation, password reset, CSRF strategy, audit log, or request ID tracing.
- WebSocket auth passes JWTs in a query string, which can appear in logs; a production design should consider a safer handshake mechanism.
- Uploads are public and there is no content scanning or MIME allow-list beyond the browser's file picker.
- Error details from some upstream failures are returned directly.

## AI and Search

The actual AI integration is `groq.Groq` in `backend/services/ai_service.py`. There is no Gemini SDK, OpenAI SDK, RAG pipeline, embeddings generation, vector database, retrieval step, tool calling, or model output schema validation.

Translation prompt shape:

```text
Translate the following message to <target_language>.
Return ONLY the translated text, nothing else.

Message: <content>
```

Summary prompt includes the room name, member names, and non-deleted messages, then asks for discussion points, decisions, and action items. Temperature is `0.2`. The result is accepted as plain text; there is no factuality checker, citation requirement, structured parser, or hallucination detection. The application limits risk by keeping summaries short and treating them as generated chat content, but it does not guarantee correctness.

Search currently uses `ilike('%query%')` scoped by `chat_id` and `deleted = false`, ordered by `created_at`. It is simple and portable through Supabase's query API, but does not use the migration's full-text index and does not rank results.

## Deployment Reality

`setup.md` contains a deployment recipe for a Render/Railway-style backend and Vercel/Netlify-style frontend, but the repository has no Dockerfile, compose file, GitHub Actions workflow, Terraform, Kubernetes manifests, migration runner, structured logging configuration, or monitoring integration.

A production deployment would need:

- One process serving FastAPI and WebSockets behind an HTTPS/WSS reverse proxy.
- Correct `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` values at frontend build time.
- A Supabase `media` bucket and all migrations applied, including the group constraint update for older databases.
- Set `CORS_ORIGINS` to the exact deployed frontend origin rather than leaving the development wildcard.
- A strategy for multi-process WebSocket fan-out; the current in-memory manager does not broadcast between instances.
- Health checks, centralized logs, metrics, alerting, rate limiting, backups, and secret management.

## Testing and Known Gaps

Available checks:

```bash
cd backend
python -m compileall -q .

cd frontend
npm run build
```

The repository contains manual WebSocket scripts (`backend/ws_test.py` and `backend/ws_test_close.py`) but no pytest suite, frontend unit-test setup, browser E2E suite, load tests, or CI test workflow. The manual scripts use fixed test values and should be treated as examples rather than a complete integration test system.

Important behavior that should receive automated coverage:

- Registration/login and duplicate handling.
- HTTP bearer/JWT expiry and WebSocket close codes.
- Room/group/private membership and admin authorization.
- Two-client delivery of messages, edits, deletes, reactions, typing, and presence.
- File upload, attachment persistence, and media forwarding.
- Expiry watcher and summary persistence.
- Mutual auto-reset and the 24-hour scheduler.
- Groq error handling and search behavior.
- Pagination boundaries and concurrent writes.
