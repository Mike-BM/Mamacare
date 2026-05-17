import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              An unexpected error occurred. This is often caused by cached application data or connection interruptions.
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left mb-6 font-mono text-xs text-destructive/80 overflow-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl"
              >
                Reload Page
              </Button>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1 border-white/10 text-white/70 hover:bg-white/5 font-bold rounded-xl"
              >
                Reset Cache
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
