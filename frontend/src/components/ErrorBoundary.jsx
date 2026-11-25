import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) {
      console.error('Unhandled application error:', error, info?.componentStack);
    } else {
      console.error('Unhandled application error.');
    }
  }

  handleRetry() {
    this.setState({ hasError: false });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  }

  handleReload() {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <main className="page">
        <section
          className="card error-boundary"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <h1 className="error-boundary__title">Something went wrong</h1>
          <p className="error-boundary__text">
            The workspace hit an unexpected error. Reload to start a clean session; your data is
            safe.
          </p>
          <div className="error-boundary__actions">
            <button
              type="button"
              className="btn p button button--primary"
              onClick={this.handleReload}
            >
              Reload workspace
            </button>
            <button type="button" className="btn button" onClick={this.handleRetry}>
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }
}
