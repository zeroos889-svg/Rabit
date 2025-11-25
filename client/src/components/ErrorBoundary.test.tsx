import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

  // Should show error heading
  expect(screen.getByRole('heading', { name: /عذراً، حدث خطأ ما/i })).toBeInTheDocument();
  });

  it('provides retry functionality', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

  // Error should be displayed
  expect(screen.getByRole('heading', { name: /عذراً، حدث خطأ ما/i })).toBeInTheDocument();

    // Fix the error and update the rendered tree
    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /إعادة المحاولة/i });
    await user.click(retryButton);

    // Component should recover
    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});
