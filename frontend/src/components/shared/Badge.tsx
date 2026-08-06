interface Props { online: boolean; isAdmin?: boolean; }
export function Badge({ online, isAdmin }: Props) {
  return (
    <span className={`badge ${isAdmin ? "badge-admin" : online ? "badge-online" : "badge-offline"}`}>
      {isAdmin ? "Admin" : online ? "● Online" : "○ Offline"}
    </span>
  );
}
