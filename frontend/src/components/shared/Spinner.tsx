export function Spinner({ small }: { small?: boolean }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`} />;
}
