import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', margin: '2rem', borderRadius: '8px' }}>
                    <h1 style={{ color: 'red' }}>Something went wrong.</h1>
                    <p style={{ color: '#666' }}>{this.state.error?.message}</p>
                    <pre style={{ textAlign: 'left', backgroundColor: '#f3f4f6', padding: '1rem', overflow: 'auto' }}>
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
