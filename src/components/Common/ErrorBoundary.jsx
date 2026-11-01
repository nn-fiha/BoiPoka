import React from "react";

// Shows a friendly recovery screen instead of a blank page when rendering crashes
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("BoiPoka crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <i className="bx bx-book-alt text-5xl text-terra"></i>
        <h1 className="mt-4 font-serif text-3xl font-bold">A page fell off the shelf</h1>
        <p className="mt-2 font-bangla text-ink/70">কিছু একটা ভুল হয়েছে। Something went wrong while showing this page.</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-terra px-5 py-2.5 font-medium text-cream hover:bg-terra-dark"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-card">
            Go home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
