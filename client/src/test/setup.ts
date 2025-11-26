import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

if (globalThis.window !== undefined) {
  // Mock window.matchMedia when running in jsdom
  Object.defineProperty(globalThis.window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(private readonly callback: IntersectionObserverCallback) {
      this.callback = callback;
    }

    disconnect(): void {
      // no-op
    }

    observe(_target: Element): void {
      // no-op
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }

    unobserve(_target: Element): void {
      // no-op
    }

    trigger(entries: IntersectionObserverEntry[]): void {
      this.callback(entries, this);
    }
  }

  // Mock ResizeObserver
  class MockResizeObserver implements ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    disconnect(): void {
      // no-op
    }

    observe(_target: Element): void {
      // no-op
    }

    unobserve(_target: Element): void {
      // no-op
    }

    trigger(entries: ResizeObserverEntry[]): void {
      this.callback(entries, this);
    }
  }

  const globalWithObservers = globalThis as typeof globalThis & {
    IntersectionObserver: typeof MockIntersectionObserver;
    ResizeObserver: typeof MockResizeObserver;
  };

  globalWithObservers.IntersectionObserver = MockIntersectionObserver;
  globalWithObservers.ResizeObserver = MockResizeObserver;
}
