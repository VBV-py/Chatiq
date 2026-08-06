import React from "react";
interface State { hasError: boolean; }
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: 32, textAlign: "center", color: "var(--danger)" }}>Something went wrong. Please refresh.</div>;
    return this.props.children;
  }
}
