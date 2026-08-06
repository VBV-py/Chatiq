// Client -> Server
export const JOIN_ROOM = "join_room";
export const LEAVE_ROOM = "leave_room";
export const SEND_MESSAGE = "send_message";
export const EDIT_MESSAGE = "edit_message";
export const DELETE_MESSAGE = "delete_message";
export const FORWARD_MESSAGE = "forward_message";
export const SEND_STICKER = "send_sticker";
export const ADD_REACTION = "add_reaction";
export const REMOVE_REACTION = "remove_reaction";
export const TYPING = "typing";
export const STOP_TYPING = "stop_typing";

// Server -> Client
export const RECEIVE_MESSAGE = "receive_message";
export const MESSAGE_EDITED = "message_edited";
export const MESSAGE_DELETED = "message_deleted";
export const REACTION_ADDED = "reaction_added";
export const REACTION_REMOVED = "reaction_removed";
export const USER_ONLINE = "user_online";
export const USER_OFFLINE = "user_offline";
export const ROOM_EXPIRED = "room_expired";
export const CHAT_RESET = "chat_reset";
export const AI_SUMMARY_READY = "ai_summary_ready";
export const MESSAGE_TRANSLATED = "message_translated";
