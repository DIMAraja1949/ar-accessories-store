import { useCallback, useState, type ImgHTMLAttributes } from 'react'
import { getOptimizedImageUrl } from '@/lib/optimized-image-url'

type OptimizedImageProps = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'className' | 'fetchPriority' | 'loading'
> & {
  src: string
  imageClassName?: string
  width?: number
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  fetchPriority = 'auto',
  loading = 'lazy',
  width = 600,
  imageClassName = '',
}: OptimizedImageProps) {
  const optimizedSrc = getOptimizedImageUrl(src, width)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const isLoaded = loadedSrc === optimizedSrc
  const isFailed = failedSrc === optimizedSrc
  const syncLoadedImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setLoadedSrc(optimizedSrc)
    }
  }, [optimizedSrc])

  return (
    <span
      className={`optimized-image${isFailed ? ' optimized-image--failed' : ''} ${className}`}
    >
      {!isLoaded && (
        <span className="optimized-image__skeleton" aria-hidden="true" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        ref={syncLoadedImage}
        onLoad={() => setLoadedSrc(optimizedSrc)}
        onError={() => setFailedSrc(optimizedSrc)}
        className={`optimized-image__img${isLoaded ? ' optimized-image__img--loaded' : ''} ${imageClassName}`}
      />
    </span>
  )
}
