import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default props', () => {
      render(<Skeleton />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass('custom-class');
    });

    it('has shimmer animation', () => {
  const { container } = render(<Skeleton />);
  const skeleton = container.firstChild;
  expect(skeleton).not.toBeNull();
  expect(skeleton).toHaveClass('animate-pulse');
  expect(skeleton).toHaveClass('before:animate-[shimmer_2s_infinite]');
    });
  });

  describe('SkeletonCard', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonCard />);
      const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      const { container } = render(<SkeletonCard className="custom-card" />);
      expect(container.firstChild).toHaveClass('custom-card');
    });
  });
});
