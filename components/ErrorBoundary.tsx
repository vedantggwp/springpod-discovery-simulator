"use client";

import { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-retro-bg flex flex-col items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="font-heading text-terminal-green text-sm mb-4">
              SYSTEM ERROR
            </h1>
            <p className="font-body text-red-400 text-lg mb-6">
              Something went wrong. The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <p className="font-body text-gray-500 text-sm mb-6 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className={cn(
                  "font-heading text-sm text-terminal-green",
                  "border-2 border-terminal-green px-4 py-2",
                  "hover:bg-terminal-green hover:text-black transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-green-400"
                )}
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "font-heading text-sm text-gray-400",
                  "border-2 border-gray-600 px-4 py-2",
                  "hover:bg-gray-600 hover:text-white transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-gray-400"
                )}
              >
                RELOAD PAGE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
