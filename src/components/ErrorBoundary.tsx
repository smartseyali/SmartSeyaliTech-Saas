import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

type Props = { children: React.ReactNode; label?: string };
type State = { error: Error | null };

/**
 * Simple error boundary. Renders a visible fallback instead of a blank page
 * when a descendant throws during render/effects.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", this.props.label || "", error, info);
    }

    reset = () => this.setState({ error: null });

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div className="min-h-full flex items-center justify-center p-8">
                <div className="max-w-lg w-full bg-card border border-destructive/30 rounded-xl p-6 text-sm space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-base font-semibold">Something went wrong</h2>
                    </div>
                    <p className="text-muted-foreground">
                        {this.props.label ? `${this.props.label} crashed. ` : ""}
                        This is almost always a data-shape issue. Open DevTools → Console for the
                        full stack trace.
                    </p>
                    <pre className="text-[11px] bg-muted/50 text-foreground p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                        {String(this.state.error?.message || this.state.error)}
                    </pre>
                    <div className="flex gap-2">
                        <button
                            onClick={this.reset}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" /> Try again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center h-8 px-3 rounded-md border border-border text-xs font-medium"
                        >
                            Hard reload
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
