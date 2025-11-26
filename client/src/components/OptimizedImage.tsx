import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./OptimizedImage.module.css";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading
 * - Responsive images with srcset
 * - WebP/AVIF format support
 * - Blur-up placeholder effect
 * - Intersection Observer for loading
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  placeholder = "blur",
  blurDataURL,
  quality = 75,
  className,
  onLoad,
  onError,
  ...props
}: Readonly<OptimizedImageProps>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!width) return undefined;

    const widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    const applicableWidths = widths.filter((w) => w <= (width || Infinity));

    return applicableWidths
      .map((w) => {
        const url = getOptimizedUrl(src, w, quality);
        return `${url} ${w}w`;
      })
      .join(", ");
  };

  // Get optimized image URL (can be customized for CDN)
  const getOptimizedUrl = (url: string, w?: number, q?: number) => {
    // For external CDN, replace with actual CDN logic
    // Example: return `https://cdn.example.com/${url}?w=${w}&q=${q}`
    
    // For local images, return as-is
    if (w && q) {
      return `${url}?w=${w}&q=${q}`;
    }
    return url;
  };

  // Blur-up placeholder styles
  const placeholderClasses = cn(
    styles.placeholder,
    "bg-gray-200 dark:bg-gray-800",
    placeholder === "blur" && !isLoaded && styles.placeholderBlur
  );

  const containerClasses = cn(
    styles.container,
    className
  );

  // Note: Inline styles are necessary here for CSS custom properties (CSS variables)
  // which need to be dynamically set based on component props
  return (
    <div 
      className={containerClasses}
      style={{
        '--img-width': width ? `${width}px` : '100%',
        '--img-height': height ? `${height}px` : 'auto',
      } as React.CSSProperties}
    >
      {/* Blur placeholder */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className={placeholderClasses}
          style={{
            "--blur-url": blurDataURL ? `url(${blurDataURL})` : undefined,
          } as React.CSSProperties}
        />
      )}

      {/* Actual image */}
      {!hasError && (
        <picture>
          {/* AVIF format (best compression) */}
          {isInView && (
            <source
              type="image/avif"
              srcSet={generateSrcSet()?.replaceAll(/\.(jpg|jpeg|png)/g, ".avif")}
              sizes={sizes}
            />
          )}

          {/* WebP format (good compression) */}
          {isInView && (
            <source
              type="image/webp"
              srcSet={generateSrcSet()?.replaceAll(/\.(jpg|jpeg|png)/g, ".webp")}
              sizes={sizes}
            />
          )}

          {/* Original format (fallback) */}
          <img
            ref={imgRef}
            src={isInView ? getOptimizedUrl(src, width, quality) : undefined}
            srcSet={isInView ? generateSrcSet() : undefined}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            {...props}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800 text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">فشل تحميل الصورة</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate blur data URL from image
 * Can be used at build time for static images
 */
export function generateBlurDataURL(imageSrc: string): string {
  // In production, this would generate actual blur data URL
  // For now, return a simple placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${40}' height='${40}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' href='${imageSrc}'/%3E%3C/svg%3E`;
}

/**
 * Background Image Component
 * For background images with optimization
 */
interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
}

export function BackgroundImage({
  src,
  alt = "",
  className,
  children,
  priority = false,
}: Readonly<BackgroundImageProps>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    const img = globalThis.Image ? new globalThis.Image() : document.createElement('img');
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  const bgStyle = {
    "--bg-image": isLoaded ? `url(${src})` : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        "bg-cover bg-center",
        className
      )}
      style={bgStyle}
      aria-label={alt}
    >
      {children}
    </div>
  );
}
