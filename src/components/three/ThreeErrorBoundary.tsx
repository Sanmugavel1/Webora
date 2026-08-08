"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches any WebGL/Three.js runtime failure so the page never shows a blank area. */
export class ThreeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("WEBORA 3D scene failed, showing static fallback:", error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
