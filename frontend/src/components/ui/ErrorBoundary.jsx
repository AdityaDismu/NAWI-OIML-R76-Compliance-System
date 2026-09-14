import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected interface error." };
  }

  componentDidCatch(error, info) {
    console.error("NAWI frontend error:", error, info);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[500px] items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-slate-950 p-6">
          <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">The test workspace encountered an interface error. Your saved backend data is not automatically deleted.</p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-slate-500">{this.state.message}</pre>
          <button type="button" onClick={this.reset} className="mt-5 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Try Again</button>
        </div>
      </div>
    );
  }
}
