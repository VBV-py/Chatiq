-- Migration to add 'group' type to chats table
-- This allows permanent groups that don't auto-expire

-- Drop the old constraint
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_type_check;

-- Add the new constraint
ALTER TABLE chats ADD CONSTRAINT chats_type_check CHECK (type IN ('chatroom', 'private', 'group'));

-- Optionally, notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
