import { useEffect, useRef, useState } from "react";

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * Hook for lazy loading with Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement = HTMLElement>(
  options: LazyLoadOptions = {}
) {
  const {
    rootMargin = "50px",
    threshold = 0,
    once = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsIntersecting(false);
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref: elementRef, isIntersecting };
}

/**
 * Hook for image preloading
 */
export function useImagePreload(src: string, priority: boolean = false) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src || !priority) return;

    const img = new Image();
    img.src = src;

    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
  }, [src, priority]);

  return { isLoaded, hasError };
}

/**
 * Hook for responsive image source selection
 */
export function useResponsiveImage(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
) {
  const [selectedSrc, setSelectedSrc] = useState(src);

  useEffect(() => {
    const updateImage = () => {
      const dpr = globalThis.devicePixelRatio || 1;
      const viewportWidth = globalThis.innerWidth * dpr;

      // Find closest width
      const targetWidth = widths.reduce((prev, curr) =>
        Math.abs(curr - viewportWidth) < Math.abs(prev - viewportWidth)
          ? curr
          : prev
      );

      setSelectedSrc(`${src}?w=${targetWidth}`);
    };

    updateImage();
    globalThis.addEventListener("resize", updateImage);

    return () => globalThis.removeEventListener("resize", updateImage);
  }, [src, widths]);

  return selectedSrc;
}

/**
 * Hook for image format support detection
 */
export function useImageFormatSupport() {
  const [formats, setFormats] = useState({
    avif: false,
    webp: false,
  });

  useEffect(() => {
    const checkFormat = async (format: "avif" | "webp") => {
      const testImages = {
        avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=",
        webp: "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
      };

      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = testImages[format];
      });
    };

    const checkFormats = async () => {
      const [avif, webp] = await Promise.all([
        checkFormat("avif"),
        checkFormat("webp"),
      ]);
      setFormats({ avif, webp });
    };

    checkFormats();
  }, []);

  return formats;
}

/**
 * Hook for blur data URL generation
 */
export function useBlurDataURL(src: string, width: number = 40, height: number = 40) {
  const [blurDataURL, setBlurDataURL] = useState<string>("");

  useEffect(() => {
    // In production, generate actual blur from image
    // For now, create SVG placeholder
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
        <filter id='blur' color-interpolation-filters='sRGB'>
          <feGaussianBlur stdDeviation='20'/>
        </filter>
        <rect width='${width}' height='${height}' fill='%23ccc' filter='url(%23blur)'/>
      </svg>
    `;
    const encoded = encodeURIComponent(svg);
    setBlurDataURL(`data:image/svg+xml,${encoded}`);
  }, [src, width, height]);

  return blurDataURL;
}

/**
 * Hook for progressive image loading
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string
) {
  const [src, setSrc] = useState(lowQualitySrc);

  useEffect(() => {
    setSrc(lowQualitySrc);

    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
    };
  }, [lowQualitySrc, highQualitySrc]);

  return src;
}

/**
 * Image loader utility for CDN integration
 */
interface ImageLoaderParams {
  src: string;
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
}

export function imageLoader({ src, width, quality = 75, format }: ImageLoaderParams): string {
  // For Cloudinary
  // return `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_${width},q_${quality},f_${format}/${src}`

  // For Cloudflare Images
  // return `https://example.com/cdn-cgi/image/width=${width},quality=${quality},format=${format}/${src}`

  // For Imgix
  // return `https://YOUR_DOMAIN.imgix.net/${src}?w=${width}&q=${quality}&fm=${format}&auto=format,compress`

  // For local/fallback
  const params = new URLSearchParams();
  if (width) params.append("w", width.toString());
  if (quality) params.append("q", quality.toString());
  if (format) params.append("f", format);

  return `${src}${params.toString() ? `?${params.toString()}` : ""}`;
}

/**
 * Generate srcset string from widths
 */
export function generateSrcSet(
  src: string,
  widths: number[],
  quality: number = 75
): string {
  return widths
    .map((width) => {
      const url = imageLoader({ src, width, quality });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Calculate optimal sizes attribute
 */
export function calculateSizes(
  breakpoints: Array<{ maxWidth: string; size: string }>,
  defaultSize: string = "100vw"
): string {
  const sizes = breakpoints.map(
    ({ maxWidth, size }) => `(max-width: ${maxWidth}) ${size}`
  );
  sizes.push(defaultSize);
  return sizes.join(", ");
}
