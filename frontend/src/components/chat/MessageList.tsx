import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Message } from "../../types/message";
import { MessageItem } from "./MessageItem";
import { Spinner } from "../shared/Spinner";

interface Props {
  messages: Message[];
  chatId: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function MessageList({ messages, chatId, loadMore, hasMore, loadingMore }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const prevHeight = useRef(0);

  // Auto-scroll to bottom on first load or new message
  useEffect(() => {
    if (isFirstLoad && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      setIsFirstLoad(false);
    } else if (!loadingMore && messages.length > 0) {
      // If a new message was added (not loading older ones), scroll down smoothly
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Maintain scroll position when loading older messages
  useLayoutEffect(() => {
    if (loadingMore && containerRef.current) {
      prevHeight.current = containerRef.current.scrollHeight;
    }
  }, [loadingMore]);

  useLayoutEffect(() => {
    if (!loadingMore && containerRef.current && prevHeight.current > 0) {
      const diff = containerRef.current.scrollHeight - prevHeight.current;
      if (diff > 0 && !isFirstLoad) {
        containerRef.current.scrollTop += diff;
      }
      prevHeight.current = 0;
    }
  }, [messages, loadingMore]);

  return (
    <div className="message-list" ref={containerRef}>
      {hasMore && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          {loadingMore ? (
            <Spinner />
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={loadMore}>
              Load older messages
            </button>
          )}
        </div>
      )}
      {messages.map(m => <MessageItem key={m.id} message={m} chatId={chatId} />)}
      <div ref={bottomRef} />
    </div>
  );
}
