import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default props', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('custom-class');
    });

    it('has shimmer animation', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-shimmer');
    });
  });

  describe('SkeletonCard', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonCard />);
      const skeletons = container.querySelectorAll('[role="presentation"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      const { container } = render(<SkeletonCard className="custom-card" />);
      expect(container.firstChild).toHaveClass('custom-card');
    });
  });
});
