import { supabase } from '@/lib/supabase'

export const PRODUCTS_STORAGE_KEY = 'ar-products'
export const PRODUCTS_STORAGE_EVENT = 'ar-products-change'
export const PRODUCTS_CACHE_KEY = 'ar-products-cache'
export const STOREFRONT_PRODUCTS_QUERY_KEY = ['storefront-products'] as const
const PRODUCTS_CHANNEL_NAME = 'ar-products-sync'
const PRODUCT_PAGE_SIZE = 100
const PRODUCT_FETCH_TIMEOUT_MS = 4500
const PRODUCT_SELECT_COLUMNS =
  'id,name,name_en,category,price,original_price,stock,image,tag,tag_en,description,description_en,sizes,colors,gallery_images,rating,review_count,materials,details,created_at'
let supabaseProductsRequest: Promise<StoredProduct[]> | null = null
let productMutationRevision = 0
const PRODUCT_CATEGORIES = [
  'Accessories',
  'Clothing',
  'Phone Cases',
  'Smartwatches',
  'Audio',
  'Jewellery',
  'Sneakers',
  'Chargers',
] as const

export function normalizeProductCategory(category: string): string {
  const normalized = category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]/g, '')

  if (normalized === 'all' || normalized === 'الكل') return 'All'
  if (normalized.includes('clothing') || normalized.includes('ملابس')) return 'Clothing'
  if (normalized.includes('phonecase') || normalized.includes('phonecover') || normalized.includes('أغطيةالهاتف')) return 'Phone Cases'
  if (normalized.includes('smartwatch') || normalized.includes('smartwatches') || normalized.includes('ساعةذكية')) return 'Smartwatches'
  if (normalized.includes('jewell') || normalized.includes('jewelr') || normalized.includes('مجوهرات')) return 'Jewellery'
  if (normalized.includes('sneaker') || normalized.includes('trainer') || normalized.includes('أحذية')) return 'Sneakers'
  if (normalized.includes('charger') || normalized.includes('شاحن')) return 'Chargers'
  if (normalized.includes('audio') || normalized.includes('headphone') || normalized.includes('صوتيات')) return 'Audio'
  if (normalized.includes('accessor') || normalized.includes('إكسسوارات')) return 'Accessories'

  return PRODUCT_CATEGORIES.find(value => value.toLowerCase() === normalized) ?? category.trim()
}

function normalizeProduct(product: StoredProduct): StoredProduct {
  return {
    ...product,
    category: normalizeProductCategory(product.category ?? 'Accessories'),
  }
}

export type StoredProduct = {
  id: string
  name: string
  nameEn?: string
  category?: string
  price: number
  stock?: number
  image: string
  tag?: string
  tagEn?: string
  description?: string
  descriptionEn?: string
  sizes?: string[]
  colors?: string[]
  galleryImages?: string[]
  originalPrice?: number
  rating?: number
  reviewCount?: number
  materials?: string
  details?: string
  createdAt?: string
}

export type ProductStoreChange = {
  type: 'save' | 'delete' | 'replace'
  productId?: string
}

export interface ProductStoreAdapter {
  getProducts(): Promise<StoredProduct[]>
  createProduct(product: StoredProduct): Promise<void>
  updateProduct(product: StoredProduct): Promise<void>
  saveProduct(product: StoredProduct): Promise<void>
  saveProducts(products: StoredProduct[]): Promise<void>
  deleteProduct(productId: string): Promise<void>
  subscribe?(listener: (change: ProductStoreChange) => void): () => void
}

type SupabaseProductRow = {
  id: string
  name: string
  name_en: string | null
  category: string
  price: number
  original_price: number | null
  stock: number
  image: string
  tag: string | null
  tag_en: string | null
  description: string | null
  description_en: string | null
  sizes: string[]
  colors: string[]
  gallery_images: string[]
  rating: number | null
  review_count: number | null
  materials: string | null
  details: string | null
  created_at: string
}

function fromSupabaseRow(row: Record<string, unknown>, index: number): StoredProduct {
  const text = (value: unknown, fallback: string) =>
    typeof value === 'string' && value.trim() ? value : fallback
  const optionalText = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value : undefined
  const number = (value: unknown, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  const stringArray = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

  return normalizeProduct({
    id: text(row.id, `product-${index}`),
    name: text(row.name, 'Untitled product'),
    nameEn: optionalText(row.name_en),
    category: text(row.category, 'Accessories'),
    price: number(row.price, 0),
    originalPrice: row.original_price == null ? undefined : number(row.original_price, 0),
    stock: number(row.stock, 0),
    image: text(row.image, '/icon.png'),
    tag: optionalText(row.tag),
    tagEn: optionalText(row.tag_en),
    description: text(row.description, ''),
    descriptionEn: optionalText(row.description_en),
    sizes: stringArray(row.sizes),
    colors: stringArray(row.colors),
    galleryImages: stringArray(row.gallery_images),
    rating: row.rating == null ? undefined : number(row.rating, 0),
    reviewCount: row.review_count == null ? undefined : number(row.review_count, 0),
    materials: optionalText(row.materials),
    details: optionalText(row.details),
    createdAt: optionalText(row.created_at),
  })
}

type SupabaseProductWrite = Pick<
  SupabaseProductRow,
  'id' | 'name' | 'category' | 'price' | 'stock' | 'image'
> & Partial<Omit<SupabaseProductRow, 'id' | 'name' | 'category' | 'price' | 'stock' | 'image'>>

function sanitizeProductForSupabase(product: StoredProduct): SupabaseProductWrite {
  return {
    id: product.id,
    name: product.name,
    category: normalizeProductCategory(product.category ?? 'Accessories'),
    price: product.price,
    stock: product.stock ?? 0,
    image: product.image,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    gallery_images: product.galleryImages ?? [],
    ...(product.nameEn !== undefined ? { name_en: product.nameEn } : {}),
    ...(product.originalPrice !== undefined ? { original_price: product.originalPrice } : {}),
    ...(product.tag !== undefined ? { tag: product.tag } : {}),
    ...(product.tagEn !== undefined ? { tag_en: product.tagEn } : {}),
    ...(product.description !== undefined ? { description: product.description } : {}),
    ...(product.descriptionEn !== undefined ? { description_en: product.descriptionEn } : {}),
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.reviewCount !== undefined ? { review_count: product.reviewCount } : {}),
    ...(product.materials !== undefined ? { materials: product.materials } : {}),
    ...(product.details !== undefined ? { details: product.details } : {}),
    ...(product.createdAt !== undefined ? { created_at: product.createdAt } : {}),
  }
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  return supabase
}

function readCachedStoredProducts(): StoredProduct[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw =
      localStorage.getItem(PRODUCTS_CACHE_KEY)
      ?? localStorage.getItem('ar-storefront-products')
    if (!raw) return null
    const cache: unknown = JSON.parse(raw)
    if (!cache || typeof cache !== 'object' || !('products' in cache)) {
      console.warn('Ignoring invalid cached products.')
      return null
    }
    const products = cache.products
    if (
      !Array.isArray(products)
      || !products.every(product =>
        product !== null
        && typeof product === 'object'
        && typeof product.id === 'string'
        && typeof product.name === 'string'
        && typeof product.image === 'string'
        && Number.isFinite(Number(product.price)),
      )
    ) {
      console.warn('Ignoring invalid cached products.')
      return null
    }
    return products as StoredProduct[]
  } catch (error) {
    console.warn('Failed to read cached products:', error)
    return null
  }
}

export function getCachedProducts(): StoredProduct[] | null {
  return readCachedStoredProducts()
}

function persistStoredProducts(products: StoredProduct[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
      products,
      updatedAt: Date.now(),
    }))
    localStorage.setItem('ar-storefront-products', JSON.stringify({
      products: products.map(product => ({
        ...product,
        nameEn: product.nameEn || product.name,
        category: normalizeProductCategory(product.category ?? 'Accessories'),
        description: product.description || '',
        descriptionEn: product.descriptionEn || product.description || '',
      })),
      updatedAt: Date.now(),
    }))
  } catch (error) {
    console.warn('Failed to persist cached products:', error)
  }
}

function persistProductChanges(update: (products: StoredProduct[]) => StoredProduct[]): void {
  const products = readCachedStoredProducts() ?? []
  persistStoredProducts(update(products))
}

async function fetchSupabaseProducts(): Promise<StoredProduct[]> {
  const client = requireSupabase()
  const products: StoredProduct[] = []

  let offset = 0
  for (;;) {
    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort()
        reject(new Error(`Product query timed out after ${PRODUCT_FETCH_TIMEOUT_MS}ms.`))
      }, PRODUCT_FETCH_TIMEOUT_MS)
    })

    try {
      const page = await Promise.race([
        client
          .from('products')
          .select(PRODUCT_SELECT_COLUMNS)
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(offset, offset + PRODUCT_PAGE_SIZE - 1)
          .abortSignal(controller.signal),
        timeout,
      ])
      if (page.error) throw page.error
      const pageRows = page.data ?? []
      if (pageRows.length === 0) return products

      const rows = pageRows.map((row, index) =>
        fromSupabaseRow(row as Record<string, unknown>, offset + index),
      )
      products.push(...rows)
      offset += pageRows.length
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }
}

function refreshSupabaseProducts(): Promise<StoredProduct[]> {
  if (!supabaseProductsRequest) {
    supabaseProductsRequest = (async () => {
      let revisionAtStart = productMutationRevision
      let products = await fetchSupabaseProducts()
      while (revisionAtStart !== productMutationRevision) {
        revisionAtStart = productMutationRevision
        products = await fetchSupabaseProducts()
      }
      const latestProducts = products
      const hasChanged =
        JSON.stringify(readCachedStoredProducts()) !== JSON.stringify(latestProducts)
      persistStoredProducts(latestProducts)
      if (hasChanged) publishProductChange({ type: 'replace' })
      return latestProducts
    })()
      .finally(() => {
        supabaseProductsRequest = null
      })
  }
  return supabaseProductsRequest
}

async function getProductsWithFallback(): Promise<StoredProduct[]> {
  const cachedProducts = readCachedStoredProducts()
  try {
    return await refreshSupabaseProducts()
  } catch (error) {
    const isStatementTimeout =
      typeof error === 'object'
      && error !== null
      && 'message' in error
      && typeof error.message === 'string'
      && /timeout|timed out|canceling statement/i.test(error.message)
    if (isStatementTimeout) {
      console.warn('Supabase product query timed out; using cached products.')
    } else {
      console.error('Supabase product query failed; using cached products:', error)
    }
    return cachedProducts ?? []
  }
}

const supabaseProductStore: ProductStoreAdapter = {
  async getProducts() {
    return getProductsWithFallback()
  },
  async createProduct(product) {
    const { error } = await requireSupabase()
      .from('products')
      .insert(sanitizeProductForSupabase(normalizeProduct(product)))
    if (error) throw error
  },
  async updateProduct(product) {
    const { data, error } = await requireSupabase()
      .from('products')
      .update(sanitizeProductForSupabase(normalizeProduct(product)))
      .eq('id', product.id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error(`Product ${product.id} was not found or could not be updated.`)
  },
  async saveProduct(product) {
    const { error } = await requireSupabase()
      .from('products')
      .upsert(sanitizeProductForSupabase(normalizeProduct(product)), { onConflict: 'id' })
    if (error) throw error
    const normalized = normalizeProduct(product)
    persistProductChanges(products => [
      ...products.filter(existing => existing.id !== normalized.id),
      normalized,
    ])
    publishProductChange({ type: 'save', productId: normalized.id })
  },
  async saveProducts(products) {
    if (products.length === 0) return
    const { error } = await requireSupabase()
      .from('products')
      .upsert(products.map(product => sanitizeProductForSupabase(normalizeProduct(product))), { onConflict: 'id' })
    if (error) throw error
    const savedProducts = products.map(normalizeProduct)
    const savedIds = new Set(savedProducts.map(product => product.id))
    persistProductChanges(existing => [
      ...existing.filter(product => !savedIds.has(product.id)),
      ...savedProducts,
    ])
  },
  async deleteProduct(productId) {
    const { data, error } = await requireSupabase()
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error(`Product ${productId} was not found or could not be deleted.`)
  },
  subscribe(listener) {
    const client = requireSupabase()
    const channel = client
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        const record = payload.new as Partial<SupabaseProductRow>
        const oldRecord = payload.old as Partial<SupabaseProductRow>
        listener({
          type: payload.eventType === 'DELETE' ? 'delete' : payload.eventType === 'INSERT' ? 'save' : 'replace',
          productId: record.id ?? oldRecord.id,
        })
      })
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          listener({ type: 'replace' })
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Supabase product realtime subscription failed', error ?? status)
        }
      })
    return () => {
      void client.removeChannel(channel)
    }
  },
}

const productStoreSubscribers = new Set<(change: ProductStoreChange) => void>()
let productStoreAdapter: ProductStoreAdapter = supabaseProductStore
let adapterUnsubscribe: (() => void) | undefined
let productChannel: BroadcastChannel | undefined
let browserListenersReady = false

function publishProductChange(change: ProductStoreChange, broadcast = true) {
  for (const subscriber of productStoreSubscribers) subscriber(change)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<ProductStoreChange>(PRODUCTS_STORAGE_EVENT, { detail: change }))
  }
  if (broadcast) productChannel?.postMessage(change)
}

function ensureBrowserListeners() {
  if (typeof window === 'undefined' || browserListenersReady) return
  browserListenersReady = true

  if (typeof BroadcastChannel !== 'undefined') {
    productChannel = new BroadcastChannel(PRODUCTS_CHANNEL_NAME)
    productChannel.addEventListener('message', event => {
      publishProductChange(event.data as ProductStoreChange, false)
    })
  }
}

function connectAdapterSubscription() {
  adapterUnsubscribe?.()
  adapterUnsubscribe = productStoreAdapter.subscribe?.(change => publishProductChange(change))
}

export function configureProductStoreAdapter(adapter: ProductStoreAdapter) {
  productStoreAdapter = adapter
  if (productStoreSubscribers.size > 0) connectAdapterSubscription()
  publishProductChange({ type: 'replace' })
}

export async function getProducts(): Promise<StoredProduct[]> {
  return productStoreAdapter.getProducts()
}

export async function getStoredProducts(): Promise<StoredProduct[]> {
  return productStoreAdapter.getProducts()
}

export async function syncProductsFromSupabase(): Promise<StoredProduct[]> {
  return refreshSupabaseProducts()
}

export async function saveProduct(product: StoredProduct): Promise<void> {
  const normalized = normalizeProduct(product)
  try {
    const { data, error } = await requireSupabase()
      .from('products')
      .upsert(sanitizeProductForSupabase(normalized), { onConflict: 'id' })
      .select('id')
      .single()
    if (error) throw error
    if (data.id !== product.id) {
      throw new Error(`Supabase saved an unexpected product ID: ${data.id}`)
    }
  } catch (error) {
    console.error('saveProduct Supabase save error:', error)
    throw error
  }
  productMutationRevision += 1
  persistProductChanges(products => [
    ...products.filter(existing => existing.id !== normalized.id),
    normalized,
  ])
  publishProductChange({ type: 'save', productId: normalized.id })
}

export async function createProduct(product: StoredProduct): Promise<void> {
  await saveProduct(product)
}

export async function updateProduct(product: StoredProduct): Promise<void> {
  await saveProduct(product)
}

export async function saveProducts(products: StoredProduct[]): Promise<void> {
  if (products.length === 0) return
  const savedProducts = products.map(normalizeProduct)
  const savedIds = new Set(savedProducts.map(product => product.id))

  try {
    const { error } = await requireSupabase()
      .from('products')
      .upsert(savedProducts.map(sanitizeProductForSupabase), { onConflict: 'id' })
    if (error) throw error
  } catch (error) {
    console.error('saveProducts Supabase bulk save error:', error)
    throw error
  }
  productMutationRevision += 1
  persistProductChanges(existing => [
    ...existing.filter(product => !savedIds.has(product.id)),
    ...savedProducts,
  ])
  publishProductChange({ type: 'replace' })
}

export async function deleteProduct(productId: string): Promise<void> {
  productMutationRevision += 1
  persistProductChanges(products => products.filter(product => product.id !== productId))
  publishProductChange({ type: 'delete', productId })

  const { data, error } = await requireSupabase()
    .from('products')
    .delete()
    .eq('id', productId)
    .select('id')
    .maybeSingle()
  if (error) {
    const errorCode = 'code' in error ? error.code : undefined
    const errorMessage = 'message' in error ? String(error.message) : ''
    if (errorCode === 'PGRST116' || /not found|0 rows|no rows/i.test(errorMessage)) return
    console.error('deleteProduct Supabase delete error:', error)
    throw error
  }
  if (!data) return
}

export async function deleteAllProducts(): Promise<void> {
  const { error } = await requireSupabase()
    .from('products')
    .delete()
    .not('id', 'is', null)
  if (error) {
    console.error('Bulk product deletion failed in Supabase:', error)
    throw error
  }

  productMutationRevision += 1
  persistStoredProducts([])
  publishProductChange({ type: 'replace' })
}

export function subscribeToProducts(listener: (change: ProductStoreChange) => void): () => void {
  ensureBrowserListeners()
  productStoreSubscribers.add(listener)
  if (productStoreSubscribers.size === 1) connectAdapterSubscription()
  return () => {
    productStoreSubscribers.delete(listener)
    if (productStoreSubscribers.size === 0) {
      adapterUnsubscribe?.()
      adapterUnsubscribe = undefined
    }
  }
}
