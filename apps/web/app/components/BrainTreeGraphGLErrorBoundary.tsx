"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

type State = { hasError: boolean };

/** Reagraph/WebGL can fail (CSP, GPU); fall back to SVG without blanking the page. */
export class BrainTreeGraphGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
