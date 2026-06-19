import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-editor flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-sidebar border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="inline-flex p-4 bg-red-950/40 border border-red-500/30 rounded-full text-red-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-text-main">Something went wrong</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Your saved work is safe.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: undefined }); window.location.reload(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded-lg text-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
