# Image Optimization Guide

## OptimizedImage Component

### Basic Usage

```typescript
import { OptimizedImage } from "@/components/OptimizedImage";

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true} // Load immediately (above fold)
/>
```

### Lazy Loading (Below Fold)

```typescript
<OptimizedImage
  src="/images/gallery.jpg"
  alt="Gallery image"
  width={800}
  height={600}
  priority={false} // Lazy load when in viewport
  placeholder="blur" // Show blur placeholder
/>
```

### Responsive Images

```typescript
<OptimizedImage
  src="/images/product.jpg"
  alt="Product"
  width={1920}
  height={1080}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### With Blur Placeholder

```typescript
<OptimizedImage
  src="/images/cover.jpg"
  alt="Cover"
  width={1200}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  quality={90}
/>
```

## Background Image Component

```typescript
import { BackgroundImage } from "@/components/OptimizedImage";

<BackgroundImage
  src="/images/background.jpg"
  alt="Background pattern"
  className="min-h-screen"
  priority={true}
>
  <div className="content">
    {/* Your content here */}
  </div>
</BackgroundImage>
```

## Image Optimization Hooks

### useLazyLoad

```typescript
import { useLazyLoad } from "@/hooks/useImageOptimization";

function GalleryImage() {
  const { ref, isIntersecting } = useLazyLoad<HTMLDivElement>({
    rootMargin: "100px",
    threshold: 0.1,
    once: true,
  });

  return (
    <div ref={ref}>
      {isIntersecting && <img src="/image.jpg" alt="Gallery" />}
    </div>
  );
}
```

### useImagePreload

```typescript
import { useImagePreload } from "@/hooks/useImageOptimization";

function HeroSection() {
  const { isLoaded, hasError } = useImagePreload("/hero.jpg", true);

  if (hasError) return <div>Failed to load</div>;
  if (!isLoaded) return <Skeleton />;

  return <img src="/hero.jpg" alt="Hero" />;
}
```

### useResponsiveImage

```typescript
import { useResponsiveImage } from "@/hooks/useImageOptimization";

function ResponsiveImg() {
  const src = useResponsiveImage("/image.jpg", [640, 750, 1080, 1920]);

  return <img src={src} alt="Responsive" />;
}
```

### useImageFormatSupport

```typescript
import { useImageFormatSupport } from "@/hooks/useImageOptimization";

function SmartImage() {
  const { avif, webp } = useImageFormatSupport();

  const getSrc = () => {
    if (avif) return "/image.avif";
    if (webp) return "/image.webp";
    return "/image.jpg";
  };

  return <img src={getSrc()} alt="Smart image" />;
}
```

### useProgressiveImage

```typescript
import { useProgressiveImage } from "@/hooks/useImageOptimization";

function ProgressiveImg() {
  const src = useProgressiveImage(
    "/image-low.jpg",  // Low quality (fast load)
    "/image-high.jpg"  // High quality
  );

  return <img src={src} alt="Progressive" />;
}
```

## CDN Integration

### Cloudinary

```typescript
import { imageLoader } from "@/hooks/useImageOptimization";

// Configure in vite.config.ts or next.config.js
const customLoader = ({ src, width, quality, format }) => {
  return `https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_${width},q_${quality},f_${format}/${src}`;
};
```

### Cloudflare Images

```typescript
const cloudflareLoader = ({ src, width, quality, format }) => {
  return `https://example.com/cdn-cgi/image/width=${width},quality=${quality},format=${format}/${src}`;
};
```

### Imgix

```typescript
const imgixLoader = ({ src, width, quality, format }) => {
  return `https://YOUR_DOMAIN.imgix.net/${src}?w=${width}&q=${quality}&fm=${format}&auto=format,compress`;
};
```

## Format Support

### Automatic Format Detection

The OptimizedImage component automatically serves:

1. **AVIF** (best compression, ~50% smaller than JPEG)
2. **WebP** (good compression, ~30% smaller than JPEG)
3. **Original format** (fallback for older browsers)

### Browser Support

- **AVIF**: Chrome 85+, Firefox 93+, Safari 16+
- **WebP**: Chrome 23+, Firefox 65+, Safari 14+
- **Fallback**: All browsers

## Performance Best Practices

### 1. Prioritize Above-Fold Images

```typescript
// Hero section - priority
<OptimizedImage priority={true} />

// Below fold - lazy load
<OptimizedImage priority={false} />
```

### 2. Use Appropriate Sizes

```typescript
<OptimizedImage
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
/>
```

Common breakpoints:
- Mobile: `(max-width: 640px) 100vw`
- Tablet: `(max-width: 1024px) 50vw`
- Desktop: `800px` or `33vw`

### 3. Set Width and Height

```typescript
// Prevents layout shift (CLS)
<OptimizedImage
  width={1200}
  height={600}
/>
```

### 4. Use Blur Placeholders

```typescript
<OptimizedImage
  placeholder="blur"
  blurDataURL="data:image/..." // Low quality placeholder
/>
```

### 5. Optimize Quality

```typescript
// Photos: 75-85 quality
<OptimizedImage quality={80} />

// Graphics/logos: 90+ quality
<OptimizedImage quality={95} />
```

## Image Widths Reference

Recommended widths for srcset:
- 640px - Mobile portrait
- 750px - Mobile landscape
- 828px - Tablet portrait
- 1080px - Tablet landscape
- 1200px - Laptop
- 1920px - Desktop
- 2048px - Large desktop
- 3840px - 4K displays

## Generating Blur Placeholders

### Manual (Online Tools)

1. Use https://blurha.sh/
2. Upload image
3. Copy data URL
4. Use in `blurDataURL` prop

### Automated (Build Time)

```typescript
import { generateBlurDataURL } from "@/components/OptimizedImage";

// In your build script
const blurDataURL = generateBlurDataURL("/image.jpg");
```

## File Size Guidelines

Target file sizes for web:
- Hero images: < 200KB
- Gallery images: < 100KB
- Thumbnails: < 30KB
- Icons: < 10KB

## Image Formats Comparison

| Format | Compression | Quality | Browser Support | Use Case |
|--------|-------------|---------|-----------------|----------|
| AVIF   | Excellent   | High    | Modern          | All images |
| WebP   | Very Good   | High    | Good            | Fallback |
| JPEG   | Good        | Medium  | Universal       | Photos |
| PNG    | None        | High    | Universal       | Graphics/logos |
| SVG    | N/A         | Vector  | Universal       | Icons/logos |

## Core Web Vitals Impact

Optimized images improve:
- **LCP** (Largest Contentful Paint): Load hero images faster
- **CLS** (Cumulative Layout Shift): Set width/height to prevent shifts
- **FCP** (First Contentful Paint): Use blur placeholders

Target metrics:
- LCP: < 2.5s
- CLS: < 0.1
- FCP: < 1.8s

## Examples

### Product Gallery

```typescript
<div className="grid grid-cols-3 gap-4">
  {products.map((product) => (
    <OptimizedImage
      key={product.id}
      src={product.image}
      alt={product.name}
      width={400}
      height={400}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      placeholder="blur"
      quality={85}
    />
  ))}
</div>
```

### Hero Section

```typescript
<div className="relative h-screen">
  <BackgroundImage
    src="/hero-bg.jpg"
    alt="Hero background"
    priority={true}
  >
    <div className="absolute inset-0 bg-black/50" />
    <div className="relative z-10 text-white">
      <h1>Welcome</h1>
    </div>
  </BackgroundImage>
</div>
```

### Blog Post

```typescript
<article>
  <OptimizedImage
    src="/blog/post-cover.jpg"
    alt={post.title}
    width={1200}
    height={630}
    priority={true}
    placeholder="blur"
    blurDataURL={post.blurDataURL}
  />
  
  <div className="prose">
    {post.content}
  </div>
</article>
```

## Troubleshooting

**Images not loading:**
- Check network tab for errors
- Verify image paths are correct
- Ensure CORS is configured for CDN

**Performance issues:**
- Use appropriate image widths
- Enable lazy loading for below-fold images
- Compress images before upload

**Layout shift:**
- Always set width and height
- Use aspect-ratio CSS
- Test with Lighthouse CLS metric

**Format support:**
- Use `<picture>` element for fallbacks
- Test in different browsers
- Monitor browser support changes
