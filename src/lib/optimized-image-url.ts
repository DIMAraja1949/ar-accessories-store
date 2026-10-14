const SUPABASE_PUBLIC_OBJECT_PATH = '/storage/v1/object/public/'
const SUPABASE_PUBLIC_RENDER_PATH = '/storage/v1/render/image/public/'
const SUPABASE_SIGNED_OBJECT_PATH = '/storage/v1/object/sign/'
const SUPABASE_SIGNED_RENDER_PATH = '/storage/v1/render/image/sign/'

export function getOptimizedImageUrl(src: string, width: number): string {
  try {
    const url = new URL(src)
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('w', String(width))
      url.searchParams.set('q', '80')
      return url.toString()
    }

    const isPublicStorageImage =
      url.pathname.includes(SUPABASE_PUBLIC_OBJECT_PATH) ||
      url.pathname.includes(SUPABASE_PUBLIC_RENDER_PATH)
    const isSignedStorageImage =
      url.searchParams.has('token') &&
      (url.pathname.includes(SUPABASE_SIGNED_OBJECT_PATH) ||
        url.pathname.includes(SUPABASE_SIGNED_RENDER_PATH))

    if (isPublicStorageImage || isSignedStorageImage) {
      url.pathname = url.pathname
        .replace(SUPABASE_PUBLIC_OBJECT_PATH, SUPABASE_PUBLIC_RENDER_PATH)
        .replace(SUPABASE_SIGNED_OBJECT_PATH, SUPABASE_SIGNED_RENDER_PATH)
      url.searchParams.set('width', String(width))
      url.searchParams.set('quality', '80')
      url.searchParams.set('format', 'webp')
      return url.toString()
    }

    return src
  } catch {
    return src
  }
}
