# NexusChat — Full Implementation Plan

Complete implementation of all backend and frontend code so the project runs with all features from the SRS v5.

## Approach

Build in strict dependency order: types → core → services → routers → WebSocket → frontend.
Use the existing `.env` (all keys are filled). No new dependencies beyond what's in `requirements.txt` and `package.json`.

---

## Backend Implementation Order

### 1. Core Layer
- **`core/config.py`** — Pydantic settings loading `.env`
- **`core/database.py`** — Supabase admin client (service role key)
- **`core/security.py`** — bcrypt password hashing + JWT sign/verify
- **`core/dependencies.py`** — `get_current_user` FastAPI dependency

### 2. Pydantic Models (request/response schemas)
- `models/user.py` — RegisterRequest, LoginRequest, UserOut
- `models/chat.py` — CreateChatroomRequest, ChatOut
- `models/message.py` — SendMessageRequest, MessageOut
- `models/reaction.py` — ReactionRequest, ReactionOut
- `models/sticker.py` — StickerOut
- `models/attachment.py` — AttachmentOut
- `models/room_summary.py` — RoomSummaryOut

### 3. Services (business logic, no HTTP)
- `services/auth_service.py` — register, login, hash/verify password
- `services/chatroom_service.py` — create, invite, join, delete, get members
- `services/private_chat_service.py` — create, delete, auto-reset propose/accept/disable
- `services/message_service.py` — send, edit, delete, forward
- `services/media_service.py` — upload to Supabase Storage, get URL
- `services/reaction_service.py` — add, remove reactions
- `services/sticker_service.py` — list stickers
- `services/search_service.py` — full-text search using tsvector
- `services/ai_service.py` — Gemini API: summarize + translate

### 4. WebSocket
- `websocket/events.py` — event name constants (already done)
- `websocket/manager.py` — ConnectionManager: connect per chat_id, broadcast, disconnect
- `websocket/handler.py` — dispatch incoming events to correct service + broadcast

### 5. Background Tasks
- `tasks/expiry_watcher.py` — asyncio loop: check chatrooms where all members offline → trigger deletion + summary
- `tasks/auto_reset_scheduler.py` — asyncio loop: check private chats with auto_reset_enabled → clear if 24h elapsed

### 6. Routers (HTTP endpoints)
- `routers/auth.py` — POST /register, /login, /logout
- `routers/chatrooms.py` — full chatroom CRUD + WebSocket `/ws/chatroom/{id}`
- `routers/private_chats.py` — private chat CRUD + WebSocket `/ws/private/{id}`
- `routers/messages.py` — send, edit, delete, forward
- `routers/media.py` — POST /upload, GET /media/{id}
- `routers/reactions.py` — add/remove reactions
- `routers/stickers.py` — list stickers
- `routers/ai.py` — translate, summarize

### 7. `main.py` — wire everything, start background tasks on startup

---

## Frontend Implementation Order

### 1. TypeScript Types (`src/types/`)
- `user.ts`, `chat.ts`, `message.ts`, `reaction.ts`, `sticker.ts`

### 2. Utils (`src/utils/`)
- `constants.ts` — API base URL, WS URL
- `formatDate.ts` — display timestamps
- `fileSize.ts` — human-readable file sizes

### 3. API Layer (`src/api/`)
- `auth.ts`, `chatrooms.ts`, `privateChats.ts`, `messages.ts`
- `media.ts`, `reactions.ts`, `stickers.ts`, `ai.ts`
- Shared axios instance with JWT interceptor

### 4. WebSocket Client (`src/socket/`)
- `socketClient.ts` — connect/disconnect, send event, on event, auto-reconnect

### 5. Global State (`src/store/`)
- `authStore.ts` — user + token, persist to localStorage
- `chatStore.ts` — chatrooms + private chats list
- `messageStore.ts` — messages keyed by chat_id
- `uiStore.ts` — active chat, modals

### 6. Custom Hooks (`src/hooks/`)
- `useAuth.ts`, `useChat.ts`, `useMessages.ts`
- `useSocket.ts`, `useSearch.ts`, `useTranslation.ts`

### 7. Shared Components (`src/components/shared/`)
- Modal, Spinner, Avatar, Badge, ErrorBoundary

### 8. Chat Components (`src/components/chat/`)
- MessageList, MessageItem, MessageInput, MessageMenu
- SystemMessage, SearchBar, SearchResults, TranslationOverlay
- ReactionBar, EmojiPicker, StickerPicker, MediaPreview
- TypingIndicator, ForwardModal

### 9. Feature Components
- `components/auth/` — LoginForm, RegisterForm
- `components/chatroom/` — ChatroomHeader, InviteMemberModal, MemberList
- `components/private/` — PrivateChatHeader, AutoResetSettings
- `components/dashboard/` — ChatroomCard, PrivateChatCard, NewChatroomModal

### 10. Pages (`src/pages/`)
- LoginPage, RegisterPage, DashboardPage
- ChatroomPage, PrivateChatPage, SettingsPage

### 11. `App.tsx` — React Router with protected routes
### 12. `main.tsx` — entry point, global CSS import
### 13. `index.html` — Vite HTML shell
### 14. `vite.config.ts`, `tsconfig.json` — build config

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth strategy | Custom JWT via PyJWT | Simple, no Supabase Auth SDK needed |
| WS routing | One WS endpoint per chat type, auth via token query param | Clean separation |
| Expiry watcher | `asyncio` background task in FastAPI lifespan | No extra infra |
| State management | Zustand | Lightweight, no boilerplate |
| HTTP client | Axios with interceptors | Auto-attach JWT |
| Styling | Vanilla CSS (single `index.css`) | Per project rules |

---

## Verification Plan

1. Run `uvicorn main:app --reload` — no import errors
2. Run `npm run dev` — Vite compiles with no TS errors
3. Register → Login → create chatroom → send message → real-time delivery ✓
4. Invite second user → both online → all-offline → auto-summary ✓
5. Private chat → auto-reset propose/accept → 24h timer check ✓
6. Translate message → search by keyword → forward message ✓
7. React to message → send sticker ✓
