import { WS_BASE } from "../utils/constants";

type EventHandler = (data: unknown) => void;

type OutboundEvent = {
  event: string;
  data: unknown;
};

class SocketClient {
  private ws: WebSocket | null = null;
  private chatId: string = "";
  private token: string = "";
  private chatType: "chatroom" | "private" = "chatroom";
  private handlers: Map<string, EventHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;
  private outboundQueue: OutboundEvent[] = [];
  private readonly maxQueueSize = 100;

  connect(chatId: string, token: string, chatType: "chatroom" | "private") {
    this.intentionalDisconnect = false;
    this.chatId = chatId;
    this.token = token;
    this.chatType = chatType;
    this._connect();
  }

  private _connect() {
    // Close any existing socket cleanly before opening a new one
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.intentionalDisconnect = true;
      this.ws.close();
    }

    const path = this.chatType === "chatroom"
      ? `/api/ws/chatroom/${this.chatId}`
      : `/api/ws/private/${this.chatId}`;
    const url = `${WS_BASE}${path}?token=${this.token}`;
    this.intentionalDisconnect = false;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      if (this.ws !== ws) return;
      console.log("[WS] Connected to", url);
      this.flushQueue();
    };

    ws.onmessage = (e) => {
      if (this.ws !== ws) return;
      try {
        const { event, data } = JSON.parse(e.data);
        console.log("[WS IN]", event, data);
        const hs = this.handlers.get(event) || [];
        hs.forEach(h => h(data));
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      console.warn("[WS] Closed", e.code, e.reason);
      if (e.code === 4001) {
        this.emit("error", "Session expired or invalid token. Please log in again.");
      } else if (!this.intentionalDisconnect) {
        this.emit("error", "Connection lost. Reconnecting...");
      }
      // Only auto-reconnect if the close was NOT intentional
      if (!this.intentionalDisconnect) {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this._connect(), 3000);
      }
    };

    ws.onerror = (e) => {
      if (this.ws !== ws) return;
      console.error("[WS] Error", e);
      this.ws?.close();
    };
  }

  send(event: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[WS OUT]", event, data);
      this.ws.send(JSON.stringify({ event, data }));
      return;
    }

    // Queue outgoing events while connecting/reconnecting so first sends are not lost.
    if (this.outboundQueue.length >= this.maxQueueSize) {
      this.outboundQueue.shift();
    }
    this.outboundQueue.push({ event, data });

    if (!this.intentionalDisconnect && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) {
      this._connect();
    } else {
      console.warn("[WS OUT QUEUED] Socket not open. State:", this.ws?.readyState);
    }
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.outboundQueue.length === 0) {
      return;
    }
    const queued = [...this.outboundQueue];
    this.outboundQueue = [];
    queued.forEach(({ event, data }) => {
      this.ws?.send(JSON.stringify({ event, data }));
    });
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return () => this.off(event, handler);
  }

  private emit(event: string, data: unknown) {
    const hs = this.handlers.get(event) || [];
    hs.forEach(h => h(data));
  }

  off(event: string, handler: EventHandler) {
    const hs = this.handlers.get(event) || [];
    this.handlers.set(event, hs.filter(h => h !== handler));
  }

  disconnect() {
    this.intentionalDisconnect = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.outboundQueue = [];
    this.handlers.clear();
    this.ws?.close();
    this.ws = null;
  }
}

export const socketClient = new SocketClient();
