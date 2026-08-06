import { useEffect, useRef } from "react";
import { Message } from "../../types/message";
import { MessageItem } from "./MessageItem";
interface Props { messages: Message[]; chatId: string; }
export function MessageList({ messages, chatId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  return (
    <div className="message-list">
      {messages.map(m => <MessageItem key={m.id} message={m} chatId={chatId} />)}
      <div ref={bottomRef} />
    </div>
  );
}
