# ChatIQ

> A Lightweight Chat Application with AI Summaries, Translation, and Search

[![Python](<https://img.shields.io/badge/Backend-Python%20%2F%20FastAPI-blue?logo=python>)](https://fastapi.tiangolo.com/)
[![React](<https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react>)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](<https://img.shields.io/badge/AI-Gemini%20API-4285F4?logo=google>)](https://ai.google.dev/)
[![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-orange)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [Database Schema](#-database-schema)
- [UI Pages](#-ui-pages)
- [Out of Scope](#-out-of-scope)

---

## Overview

ChatIQ is a focused, real-time web chat application built as an academic/student project. It provides **three chat modes** — a temporary group chatroom, a persistent permanent group, and a persistent private chat — each powered by **three AI utilities**: summarization, translation, and message search.

---

## Features

### Feature 1 — Temporary Chatroom

- Multi-user, invite-based group room created by one admin
- Admin can invite/remove members and delete the room at any time
- **Auto-expiry**: room is automatically destroyed when all members go offline
- **AI Summary**: generated before room deletion (and on-demand), posted as a system message with chatroom name, members present, and timestamp
- Expiry summary is preserved and delivered to all past members even after the room is deleted

### Feature 1b — Permanent Groups

- Functions identically to a temporary chatroom (invite-based, multi-user)
- **Persistent**: Unlike temporary rooms, permanent groups are never auto-deleted when members go offline
- The group creator (admin) can still manually delete the group at any time
- Perfect for long-term teams and persistent study groups

### Feature 2 — Private Chat

- Persistent one-to-one conversation (WhatsApp-style)
- Either user can manually delete the conversation
- **24-hour Auto-Reset**: both users can opt-in to auto-clear messages every 24 hours; requires mutual agreement; either side can disable it
- Online/offline status and message delivery/read indicators

### Feature 3 — AI Translation

- Translate any individual message into a preferred language on request
- Each user sets their preferred target language in settings
- Translation is shown only to the requester — original message unchanged for others
- Powered by Gemini API

### Feature 4 — Message Search

- Search within a chatroom or private chat by word or sentence
- Results ranked by relevance, with sender and timestamp
- Powered by PostgreSQL full-text search (tsvector/tsquery + GIN index)
- Scoped per chat — no cross-chat or global search

### Feature 5 — Message Actions

- **Delete/Unsend**: removes message for all participants in real time
- **Edit**: edit own text messages only; shows "edited" indicator; media messages cannot be edited
- **Copy**: copy any visible message text to clipboard
- **Forward**: forward any visible message (text or media) to another chat

### Feature 6 — Reactions & Stickers

- React to any message with emoji (👍 ❤️ 😂 😮 😢 etc.)
- Multiple reactions from multiple users on a single message; remove your own reaction
- Send **static stickers** from a fixed, app-bundled sticker pack as standalone messages

---

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Frontend       | React + TypeScript (Vite)                                 |
| Backend / API  | Python — FastAPI                                         |
| Real-time      | WebSockets (FastAPI native)                               |
| Authentication | JWT (Supabase Auth or custom JWT)                         |
| Database       | Supabase (managed PostgreSQL)                             |
| Media Storage  | Supabase Storage                                          |
| Message Search | PostgreSQL full-text search (tsvector/tsquery)            |
| AI Provider    | Gemini API (Flash model) — summarization and translation |

---

## Project Structure

```
ChatIQ/
│
├── README.md
├── .env.example
├── .gitignore
│
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # App entry point, router registration
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── core/                         # App-wide config & utilities
│   │   ├── config.py                 # Settings (env vars, JWT secret, etc.)
│   │   ├── database.py               # Supabase client setup
│   │   ├── security.py               # Password hashing, JWT creation/validation
│   │   └── dependencies.py           # FastAPI dependency injection (get_current_user)
│   │
│   ├── models/                       # Pydantic schemas (request/response models)
│   │   ├── user.py
│   │   ├── chat.py
│   │   ├── message.py
│   │   ├── reaction.py
│   │   ├── sticker.py
│   │   ├── attachment.py
│   │   └── room_summary.py
│   │
│   ├── routers/                      # FastAPI route handlers
│   │   ├── auth.py                   # POST /register, /login, /logout
│   │   ├── chatrooms.py              # Chatroom CRUD, invite, join, summarize
│   │   ├── private_chats.py          # Private chat create, delete, auto-reset
│   │   ├── messages.py               # Send, edit, delete, forward messages
│   │   ├── media.py                  # POST /upload, GET /media/{id}
│   │   ├── reactions.py              # Add/remove emoji reactions
│   │   ├── stickers.py               # List sticker packs, send sticker
│   │   └── ai.py                     # POST /ai/translate, /ai/summarize
│   │
│   ├── services/                     # Business logic layer
│   │   ├── auth_service.py           # Registration, login, token management
│   │   ├── chatroom_service.py       # Chatroom lifecycle, expiry detection
│   │   ├── private_chat_service.py   # Private chat, auto-reset scheduler
│   │   ├── message_service.py        # Message CRUD, forward, search
│   │   ├── media_service.py          # Upload/retrieve via Supabase Storage
│   │   ├── reaction_service.py       # Reaction add/remove
│   │   ├── sticker_service.py        # Sticker listing and seeding
│   │   ├── search_service.py         # Full-text search queries
│   │   └── ai_service.py             # Gemini API calls (summarize, translate)
│   │
│   ├── websocket/                    # WebSocket connection management
│   │   ├── manager.py                # ConnectionManager (connect, disconnect, broadcast)
│   │   ├── handler.py                # Event dispatcher (routes WS events to services)
│   │   └── events.py                 # Event name constants
│   │
│   ├── tasks/                        # Background / scheduled tasks
│   │   ├── expiry_watcher.py         # Monitors all-members-offline → triggers room expiry
│   │   └── auto_reset_scheduler.py   # Fires 24-hr auto-reset for opted-in private chats
│   │
│   └── db/                           # Database helpers & migrations
│       ├── migrations/
│       │   ├── 001_create_users.sql
│       │   ├── 002_create_chats.sql
│       │   ├── 003_create_chat_members.sql
│       │   ├── 004_create_messages.sql
│       │   ├── 005_create_reactions.sql
│       │   ├── 006_create_stickers.sql
│       │   ├── 007_create_attachments.sql
│       │   └── 008_create_room_summaries.sql
│       └── seed_stickers.py          # Seeds fixed sticker pack into Stickers table
│
├── frontend/                         # React + TypeScript (Vite) frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── public/
│   │   └── stickers/                 # Bundled static sticker images
│   │       └── pack1/
│   │           ├── sticker_01.png
│   │           └── ...
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── api/                      # REST endpoint wrappers
│       │   ├── auth.ts
│       │   ├── chatrooms.ts
│       │   ├── privateChats.ts
│       │   ├── messages.ts
│       │   ├── media.ts
│       │   ├── reactions.ts
│       │   ├── stickers.ts
│       │   └── ai.ts
│       │
│       ├── socket/                   # WebSocket client
│       │   ├── socketClient.ts
│       │   └── socketEvents.ts
│       │
│       ├── store/                    # Global state (Zustand / Context)
│       │   ├── authStore.ts
│       │   ├── chatStore.ts
│       │   ├── messageStore.ts
│       │   └── uiStore.ts
│       │
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ChatroomPage.tsx
│       │   ├── PrivateChatPage.tsx
│       │   └── SettingsPage.tsx
│       │
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   │
│       │   ├── chat/
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageItem.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   ├── MessageMenu.tsx
│       │   │   ├── SystemMessage.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── SearchResults.tsx
│       │   │   ├── TranslationOverlay.tsx
│       │   │   ├── ReactionBar.tsx
│       │   │   ├── EmojiPicker.tsx
│       │   │   ├── StickerPicker.tsx
│       │   │   ├── MediaPreview.tsx
│       │   │   ├── TypingIndicator.tsx
│       │   │   └── ForwardModal.tsx
│       │   │
│       │   ├── chatroom/
│       │   │   ├── ChatroomHeader.tsx
│       │   │   ├── InviteMemberModal.tsx
│       │   │   └── MemberList.tsx
│       │   │
│       │   ├── private/
│       │   │   ├── PrivateChatHeader.tsx
│       │   │   └── AutoResetSettings.tsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── ChatroomCard.tsx
│       │   │   ├── PrivateChatCard.tsx
│       │   │   └── NewChatroomModal.tsx
│       │   │
│       │   └── shared/
│       │       ├── Avatar.tsx
│       │       ├── Badge.tsx
│       │       ├── Modal.tsx
│       │       ├── Spinner.tsx
│       │       └── ErrorBoundary.tsx
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useChat.ts
│       │   ├── useMessages.ts
│       │   ├── useSocket.ts
│       │   ├── useSearch.ts
│       │   └── useTranslation.ts
│       │
│       ├── types/
│       │   ├── user.ts
│       │   ├── chat.ts
│       │   ├── message.ts
│       │   ├── reaction.ts
│       │   └── sticker.ts
│       │
│       └── utils/
│           ├── formatDate.ts
│           ├── fileSize.ts
│           └── constants.ts
│
└── srs/
    └── ChatIQ_SRS_v5.pdf
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Supabase](https://supabase.com/) project (free tier)
- [Google Gemini API](https://ai.google.dev/) key (free tier)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your keys
# Apply db/migrations/ in order via Supabase SQL editor
python db/seed_stickers.py
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env            # fill in backend URL
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

**Backend `.env`**

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend `.env`**

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

---

## API Reference

### Auth

| Method | Endpoint  | Description        |
| ------ | --------- | ------------------ |
| POST   | /register | Register new user  |
| POST   | /login    | Login, receive JWT |
| POST   | /logout   | End session        |

### Chatrooms

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| POST   | /chatrooms                       | Create chatroom       |
| POST   | /chatrooms/{id}/invite           | Invite a user         |
| POST   | /chatrooms/{id}/join             | Join the room         |
| DELETE | /chatrooms/{id}/members/{userId} | Admin removes member  |
| DELETE | /chatrooms/{id}                  | Admin deletes room    |
| POST   | /chatrooms/{id}/summarize        | On-demand AI summary  |
| GET    | /chatrooms/{id}/messages         | Fetch message history |
| GET    | /chatrooms/{id}/search?q=...     | Search messages       |

### Private Chats

| Method | Endpoint                               | Description           |
| ------ | -------------------------------------- | --------------------- |
| POST   | /private-chats                         | Start private chat    |
| GET    | /private-chats/{id}/messages           | Fetch message history |
| GET    | /private-chats/{id}/search?q=...       | Search messages       |
| DELETE | /private-chats/{id}                    | Delete the chat       |
| POST   | /private-chats/{id}/auto-reset/propose | Propose auto-reset    |
| POST   | /private-chats/{id}/auto-reset/accept  | Accept auto-reset     |
| POST   | /private-chats/{id}/auto-reset/disable | Disable auto-reset    |

### Messages & Media

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| POST   | /messages                        | Send a message        |
| PUT    | /messages/{id}                   | Edit text message     |
| DELETE | /messages/{id}                   | Delete/unsend message |
| POST   | /messages/{id}/forward           | Forward message       |
| POST   | /messages/{id}/reactions         | Add emoji reaction    |
| DELETE | /messages/{id}/reactions/{emoji} | Remove reaction       |
| POST   | /upload                          | Upload media file     |
| GET    | /media/{id}                      | Get media file        |

### Stickers

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| GET    | /stickers         | List sticker packs     |
| POST   | /messages/sticker | Send a sticker message |

### AI

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| POST   | /ai/translate | Translate a message   |
| POST   | /ai/summarize | Generate room summary |

---

## WebSocket Events

### Client → Server

| Event                | Description                          |
| -------------------- | ------------------------------------ |
| join_room            | Join a chat to receive its events    |
| leave_room           | Leave a chat                         |
| send_message         | Send a new message                   |
| edit_message         | Edit own text message                |
| delete_message       | Delete/unsend own message            |
| forward_message      | Forward a message to another chat    |
| send_sticker         | Send a sticker as standalone message |
| add_reaction         | React to a message with emoji        |
| remove_reaction      | Remove own reaction                  |
| typing / stop_typing | Signal typing status                 |

### Server → Client

| Event                      | Description                                 |
| -------------------------- | ------------------------------------------- |
| receive_message            | New message pushed to participants          |
| message_edited             | Message was edited                          |
| message_deleted            | Message was deleted/unsent                  |
| reaction_added             | Reaction placed on a message                |
| reaction_removed           | Reaction removed from a message             |
| user_online / user_offline | Presence changes (used for chatroom expiry) |
| room_expired               | Chatroom deleted, summary included          |
| chat_reset                 | Private chat auto-reset occurred            |
| ai_summary_ready           | AI summary delivered                        |
| message_translated         | Translated message returned to requester    |

---

## Database Schema

### Users

| Field              | Description                         |
| ------------------ | ----------------------------------- |
| id                 | Primary key                         |
| username           | Unique display name                 |
| email              | Unique email for login              |
| password_hash      | bcrypt-hashed password              |
| preferred_language | Default language for AI translation |
| created_at         | Account creation timestamp          |

### Chats

| Field                  | Description                            |
| ---------------------- | -------------------------------------- |
| id                     | Primary key                            |
| type                   | "chatroom" or "private"                |
| name                   | Chatroom name (null for private chats) |
| admin_id               | FK → Users (null for private chats)   |
| auto_reset_enabled     | 24-hr auto-reset active flag           |
| auto_reset_accepted_by | List of user IDs who accepted          |
| created_at             | Creation timestamp                     |
| last_reset_at          | Last auto-reset timestamp              |

### Chat Members

| Field     | Description                              |
| --------- | ---------------------------------------- |
| id        | Primary key                              |
| chat_id   | FK → Chats                              |
| user_id   | FK → Users                              |
| is_online | For all-members-offline expiry detection |
| joined_at | Timestamp the member joined              |

### Messages

| Field          | Description                                 |
| -------------- | ------------------------------------------- |
| id             | Primary key                                 |
| chat_id        | FK → Chats                                 |
| sender_id      | FK → Users (null when sender is AI)        |
| sender_type    | "user" or "ai"                              |
| content        | Message text (null for sticker messages)    |
| message_type   | text, image, video, audio, file, or sticker |
| sticker_id     | FK → Stickers (when type is sticker)       |
| edited         | True if text has been edited                |
| deleted        | True if message has been unsent             |
| forwarded_from | FK → Messages (nullable)                   |
| search_vector  | Generated tsvector column with GIN index    |
| created_at     | Send timestamp                              |

### Reactions

| Field      | Description        |
| ---------- | ------------------ |
| id         | Primary key        |
| message_id | FK → Messages     |
| user_id    | FK → Users        |
| emoji      | Reaction emoji     |
| created_at | Reaction timestamp |

Unique constraint on (message_id, user_id, emoji).

### Stickers

| Field         | Description                      |
| ------------- | -------------------------------- |
| id            | Primary key                      |
| pack_name     | Sticker pack name                |
| image_url     | Storage location of static image |
| display_order | Sort order within pack           |

### Attachments

| Field      | Description          |
| ---------- | -------------------- |
| id         | Primary key          |
| message_id | FK → Messages       |
| file_url   | Supabase Storage URL |
| file_name  | Original file name   |
| file_size  | Size in bytes        |
| mime_type  | MIME type            |

### Room Summaries

| Field           | Description                              |
| --------------- | ---------------------------------------- |
| id              | Primary key                              |
| chat_id         | Chatroom ID at summarization time        |
| chat_name       | Chatroom name (preserved after deletion) |
| members_present | List of usernames present                |
| summary_text    | AI-generated summary content             |
| generated_at    | Summary generation timestamp             |
| trigger         | "manual" or "expiry"                     |

---

## UI Pages

| Page               | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| Login              | User login                                                                         |
| Register           | New user registration                                                              |
| Dashboard          | All active chatrooms and private chats                                             |
| Chatroom View      | Messaging, media, stickers, reactions, invite, search, summarize, per-message menu |
| Private Chat View  | Messaging, media, stickers, reactions, search, delete, auto-reset toggle           |
| Profile / Settings | User profile and preferred translation language                                    |

---

## Out of Scope

- Friend/contact system, friend requests, blocking
- Group admin hierarchies beyond a single room-admin role
- Message pinning or reply-to threading
- Editing media messages (edit is text-only)
- Animated stickers, custom sticker uploads, user-created packs
- AI features beyond summarization, translation, and search
- Voice or video calling
- Push notifications outside the app
- Cross-chat or global search

---

## Success Criteria

- [ ] Secure registration, login, logout
- [ ] Create chatrooms, invite members, real-time messaging + media sharing
- [ ] Chatroom auto-deletion on admin action or all-offline
- [ ] AI summaries on-demand and at room expiry
- [ ] Persistent private chat with real-time messaging + media sharing
- [ ] Manual deletion of private chat
- [ ] Mutually-agreed 24-hour auto-reset for private chats
- [ ] Message translation into preferred language
- [ ] In-chat search by word or sentence
- [ ] Delete/unsend and edit own messages in real time
- [ ] Copy and forward any visible message
- [ ] Emoji reactions and static sticker messages
- [ ] All-Python backend with Supabase as sole DB/storage provider
- [ ] Deployed and accessible for demonstration

---

*Author: VT — ChatIQ SRS v5 — August 2026*
