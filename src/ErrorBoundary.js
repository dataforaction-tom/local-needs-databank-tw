import React from 'react';  // Make sure React is imported

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      this.setState({ error: error });
      console.error("Error caught by Error Boundary:", error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div>
            <h1>Something went wrong.</h1>
            <p>{this.state.error?.message}</p>
          </div>
        );
      }
  
      return this.props.children;
    }
  }
  
  export default ErrorBoundary;  // Ensure this line is present
  
  