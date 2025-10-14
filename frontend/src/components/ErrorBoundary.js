import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#21262d',
          color: '#f0f6fc',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#f85149', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#238636',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
