// TICKET-ADV113 — withErrorBoundary HOC: wraps a component in an error boundary.
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError( error) {
    // TODO(TICKET-ADV113): return new state so the next render shows the
    //                     fallback UI (e.g. { error }).
    return error;
  }

  componentDidCatch(error, info) {
    // TODO(TICKET-ADV113): log the error (in prod we'd ship to Sentry / a
    //                     browser-side logger). console.error is fine here.
    console.error('ErrorBoundary caught', error, info);
  }
  handleReset() {
    this.setState({ error: null });
  }

  render() {
    // TODO(TICKET-ADV113): if this.state.error is set, render an
    //                     accessible fallback with a "Try again" button that
    //                     clears the error state. Otherwise render children.
    if (this.state.error) {
      return (
        <div role="alert" className="error-fallback">
          <h2>Something went wrong</h2>
          <pre>{String(this.state.error.message || this.state.error)}</pre>
          <button type="button" onClick={this.handleReset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function withErrorBoundary(Component) {
  function WithErrorBoundary(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  }
  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WithErrorBoundary;
}
