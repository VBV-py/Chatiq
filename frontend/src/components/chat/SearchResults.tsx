import { Message } from "../../types/message";
import { formatFullDate } from "../../utils/formatDate";
interface Props { results: Message[]; }
export function SearchResults({ results }: Props) {
  if (!results.length) return <div className="text-muted p-16">No results found.</div>;
  return (
    <div className="search-results">
      {results.map(m => (
        <div key={m.id} className="search-result">
          <div className="search-result-meta">{m.sender_username} · {formatFullDate(m.created_at)}</div>
          <div className="search-result-content">{m.content}</div>
        </div>
      ))}
    </div>
  );
}
