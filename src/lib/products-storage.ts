import { supabase } from '@/lib/supabase'

export const PRODUCTS_STORAGE_KEY = 'ar-products'
export const PRODUCTS_STORAGE_EVENT = 'ar-products-change'
const PRODUCTS_CHANNEL_NAME = 'ar-products-sync'
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

export const DEFAULT_PRODUCTS: StoredProduct[] = [
  {
    id: 'default-premium-streetwear-hoodie-test',
    name: 'هودي ستريت وير فاخر',
    nameEn: 'Premium Streetwear Hoodie',
    category: 'Clothing',
    price: 349,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90',
    description: 'هودي ستريت وير فاخر بقصة مريحة وخيارات ألوان متعددة.',
    descriptionEn: 'A premium streetwear hoodie with a relaxed fit, available in three classic colors.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'White', 'Khaki'],
    galleryImages: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90&crop=entropy',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    id: 'default-everyday-mag-case',
    name: 'Everyday Mag Case',
    nameEn: 'Everyday Mag Case',
    category: 'Phone Cases',
    price: 249,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1601592690120-a7cefd9c477a?auto=format&fit=crop&w=900&q=85',
    description: 'كوري سليم وحامي مع لمسة مطفية مريحة للاستعمال اليومي.',
    descriptionEn: 'A slim, protective case with a comfortable matte finish for everyday use.',
  },
  {
    id: 'default-smartwatch',
    name: 'ساعة ذكية نشطة',
    nameEn: 'Active Smartwatch',
    category: 'Smartwatches',
    price: 899,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1750776100861-30c172651817?auto=format&fit=crop&w=900&q=85',
    description: 'ساعة يومية متعددة الاستخدامات بشاشة واضحة وتتبع للنشاط طوال اليوم.',
    descriptionEn: 'A versatile everyday smartwatch with a clear display and all-day activity tracking.',
  },
  {
    id: 'default-minimalist-metal-bracelet',
    name: 'سوار معدني مينيمالست',
    nameEn: 'Minimalist Metal Bracelet',
    category: 'Jewellery',
    price: 349,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1611591475871-2ee8ab22349a?auto=format&fit=crop&w=900&q=85',
    description: 'مصمم خصيصاً لأناقة يومية راقية من الستانلس ستيل.',
    descriptionEn: 'A refined stainless-steel bracelet designed for elegant everyday wear.',
  },
  {
    id: 'default-classic-silver-ring',
    name: 'خاتم فضي كلاسيكي',
    nameEn: 'Classic Silver Ring',
    category: 'Jewellery',
    price: 299,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85',
    description: 'خاتم فضي مصقول بأسلوب كلاسيكي هادئ وراقي.',
    descriptionEn: 'A polished silver ring with a timeless, understated style.',
  },
  {
    id: 'default-modern-leather-sneakers',
    name: 'حذاء جلدي عصري',
    nameEn: 'Modern Leather Sneakers',
    category: 'Sneakers',
    price: 1199,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85',
    description: 'أحذية جلدية فاخرة تجمع بين الراحة القصوى والتصميم الحضري النظيف.',
    descriptionEn: 'Premium leather sneakers combining lasting comfort with a clean urban design.',
  },
  {
    id: 'default-pro-studio-headphones',
    name: 'سماعات استوديو برو',
    nameEn: 'Pro Studio Headphones',
    category: 'Audio',
    price: 549,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1600375104627-c94c416deefa?auto=format&fit=crop&w=900&q=85',
    description: 'سماعات لاسلكية مدمجة لمكالمات واضحة وصوت غني.',
    descriptionEn: 'Compact wireless headphones with clear calls and rich sound.',
  },
  {
    id: 'default-classic-running-sneakers',
    name: 'سبادريل الجري الكلاسيكي',
    nameEn: 'Classic Running Sneakers',
    category: 'Sneakers',
    price: 899,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    description: 'حذاء رياضي خفيف مصمم للتمارين اليومية والمظهر العصري السهل.',
    descriptionEn: 'Lightweight sneakers made for daily workouts and effortless casual style.',
  },
  {
    id: 'default-magnetic-desk-charger',
    name: 'شاحن مكتب مغناطيسي',
    nameEn: 'Magnetic Desk Charger',
    category: 'Chargers',
    price: 329,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1642418714495-87fcca453f70?auto=format&fit=crop&w=900&q=85',
    description: 'رفيق شحن أنيق يحافظ على طاقة أجهزتك ومكتبك منظماً.',
    descriptionEn: 'A stylish charging companion that keeps your devices powered and desk tidy.',
  },
  {
    id: 'default-streetwear-hoodie',
    name: 'هودي ستريت وير',
    nameEn: 'Everyday Streetwear Hoodie',
    category: 'Clothing',
    price: 349,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    description: 'هودي قطني دافئ بقصة مريحة ولمسة عصرية، مناسب للخروج اليومي.',
    descriptionEn: 'A soft cotton hoodie with a relaxed fit, made for comfortable everyday layering.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
  },
  {
    id: 'default-cotton-t-shirt',
    name: 'تيشيرت أساسي من القطن',
    nameEn: 'Essential Cotton T-Shirt',
    category: 'Clothing',
    price: 189,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    description: 'تيشيرت قطني خفيف وناعم، ساهل يتلبس مع أي إطلالة.',
    descriptionEn: 'A lightweight, soft cotton tee that pairs easily with your everyday looks.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
  },
  {
    id: 'default-relaxed-linen-shirt',
    name: 'قميجة كتان للصيف',
    nameEn: 'Relaxed Linen Shirt',
    category: 'Clothing',
    price: 329,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85',
    description: 'قميجة كتان بقصة مرتاحة، كتخليك مرتاح وأنيق فالأيام الدافئة.',
    descriptionEn: 'A breathable relaxed-fit linen shirt for effortless warm-weather style.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
  },
  {
    id: 'default-essential-oversized-hoodie',
    name: 'هودي أساسي بقصة واسعة',
    nameEn: 'Essential Oversized Hoodie',
    category: 'Clothing',
    price: 749,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    description: 'هودي فاخر من القطن الثقيل بقصة واسعة وتفاصيل بسيطة للاستخدام اليومي.',
    descriptionEn: 'A premium heavyweight cotton hoodie with an easy oversized fit and clean everyday styling.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
    materials: 'Heavyweight cotton fleece',
  },
  {
    id: 'default-premium-cotton-sweatshirt',
    name: 'سويت شيرت قطني فاخر',
    nameEn: 'Premium Cotton Sweatshirt',
    category: 'Clothing',
    price: 549,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85',
    description: 'سويت شيرت ناعم من القطن عالي الجودة بقصة مريحة وتشطيب أنيق.',
    descriptionEn: 'A soft, premium cotton sweatshirt with a relaxed fit and refined finish.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
    materials: 'Premium brushed cotton',
  },
  {
    id: 'default-minimalist-zip-jacket',
    name: 'جاكيت بسحاب بتصميم بسيط',
    nameEn: 'Minimalist Zip Jacket',
    category: 'Clothing',
    price: 899,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
    description: 'جاكيت أنيق بسحاب كامل وخطوط نظيفة، مثالي للطبقات في المواسم الانتقالية.',
    descriptionEn: 'A polished full-zip jacket with clean lines, ideal for layering between seasons.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
    materials: 'Cotton-blend twill',
  },
  {
    id: 'default-heavyweight-streetwear-tee',
    name: 'تيشيرت ستريت وير من القطن الثقيل',
    nameEn: 'Heavyweight Streetwear Tee',
    category: 'Clothing',
    price: 279,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    description: 'تيشيرت ستريت وير من قطن متين بقصة واسعة وملمس فاخر.',
    descriptionEn: 'A durable heavyweight cotton streetwear tee with a relaxed fit and premium feel.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Beige', 'White'],
    materials: 'Heavyweight cotton jersey',
  },
]

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
  seedDefaultsIfEmpty?(): Promise<void>
  subscribe?(listener: (change: ProductStoreChange) => void): () => void
}

type SupabaseProductRow = {
  id: string
  title: string
  title_en: string | null
  category: string
  price: number
  original_price: number | null
  stock: number
  featured_image: string
  tags: string[]
  description: string | null
  description_en: string | null
  short_description: string | null
  sizes: string[]
  colors: string[]
  gallery_images: string[]
  rating: number | null
  reviews_count: number | null
  materials: string | null
  details_material: string | null
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
    name: text(row.title, 'Untitled product'),
    nameEn: optionalText(row.title_en),
    category: text(row.category, 'Accessories'),
    price: number(row.price, 0),
    originalPrice: row.original_price == null ? undefined : number(row.original_price, 0),
    stock: number(row.stock, 0),
    image: text(row.featured_image, '/icon.png'),
    tag: stringArray(row.tags).join(', ') || undefined,
    description: text(row.description, text(row.short_description, '')),
    descriptionEn: optionalText(row.description_en),
    sizes: stringArray(row.sizes),
    colors: stringArray(row.colors),
    galleryImages: stringArray(row.gallery_images),
    rating: row.rating == null ? undefined : number(row.rating, 0),
    reviewCount: row.reviews_count == null ? undefined : number(row.reviews_count, 0),
    materials: optionalText(row.materials),
    details: optionalText(row.details_material),
    createdAt: optionalText(row.created_at),
  })
}

type SupabaseProductWrite = Pick<
  SupabaseProductRow,
  'id' | 'title' | 'category' | 'price' | 'stock' | 'featured_image'
> & Partial<Omit<SupabaseProductRow, 'id' | 'title' | 'category' | 'price' | 'stock' | 'featured_image'>>

function sanitizeProductForSupabase(product: StoredProduct): SupabaseProductWrite {
  return {
    id: product.id,
    title: product.name,
    category: normalizeProductCategory(product.category ?? 'Accessories'),
    price: product.price,
    stock: product.stock ?? 0,
    featured_image: product.image,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    gallery_images: product.galleryImages ?? [],
    ...(product.nameEn !== undefined ? { title_en: product.nameEn } : {}),
    ...(product.originalPrice !== undefined ? { original_price: product.originalPrice } : {}),
    ...(product.tag !== undefined ? { tags: product.tag.split(',').map(tag => tag.trim()).filter(Boolean) } : {}),
    ...(product.description !== undefined ? { description: product.description } : {}),
    ...(product.descriptionEn !== undefined ? { description_en: product.descriptionEn } : {}),
    ...(product.description !== undefined ? { short_description: product.description } : {}),
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.reviewCount !== undefined ? { reviews_count: product.reviewCount } : {}),
    ...(product.materials !== undefined ? { materials: product.materials } : {}),
    ...(product.details !== undefined ? { details_material: product.details } : {}),
    ...(product.createdAt !== undefined ? { created_at: product.createdAt } : {}),
  }
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  return supabase
}

const supabaseProductStore: ProductStoreAdapter = {
  async getProducts() {
    const { data, error } = await requireSupabase()
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? [])
      .map((row, index) => fromSupabaseRow(row as Record<string, unknown>, index))
      .filter(product => product.id && product.name && product.image)
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
  },
  async saveProducts(products) {
    if (products.length === 0) return
    const { error } = await requireSupabase()
      .from('products')
      .upsert(products.map(product => sanitizeProductForSupabase(normalizeProduct(product))), { onConflict: 'id' })
    if (error) throw error
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
  async seedDefaultsIfEmpty() {
    const client = requireSupabase()
    const { data, error } = await client.from('products').select('id').limit(1)
    if (error) throw error
    if (data.length > 0) return

    const { error: seedError } = await client
      .from('products')
      .upsert(DEFAULT_PRODUCTS.map(sanitizeProductForSupabase), { onConflict: 'id' })
    if (seedError) throw seedError
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
  try {
    const { data, error } = await requireSupabase()
      .from('products')
      .select('*')
    if (error) throw error

    return (data ?? []).map((row, index) =>
      fromSupabaseRow(row as Record<string, unknown>, index),
    )
  } catch (error) {
    console.error('getStoredProducts Supabase fetch failed:', error)
    throw error
  }
}

export async function saveProduct(product: StoredProduct): Promise<void> {
  try {
    const { data, error } = await requireSupabase()
      .from('products')
      .upsert(sanitizeProductForSupabase(normalizeProduct(product)), { onConflict: 'id' })
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
  publishProductChange({ type: 'save', productId: product.id })
}

export async function createProduct(product: StoredProduct): Promise<void> {
  await saveProduct(product)
}

export async function updateProduct(product: StoredProduct): Promise<void> {
  await saveProduct(product)
}

export async function saveProducts(products: StoredProduct[]): Promise<void> {
  try {
    if (products.length === 0) return
    const { error } = await requireSupabase()
      .from('products')
      .upsert(products.map(product => sanitizeProductForSupabase(normalizeProduct(product))), { onConflict: 'id' })
    if (error) throw error
  } catch (error) {
    console.log('saveProducts Supabase bulk save error:', error)
    throw error
  }
  publishProductChange({ type: 'replace' })
}

export async function deleteProduct(productId: string): Promise<void> {
  const { data, error } = await requireSupabase()
    .from('products')
    .delete()
    .eq('id', productId)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('deleteProduct Supabase delete error:', error)
    throw error
  }
  if (!data) {
    throw new Error(`Product ${productId} was not found or could not be deleted.`)
  }
  publishProductChange({ type: 'delete', productId })
}

export async function seedDefaultProductsIfEmpty(): Promise<void> {
  await productStoreAdapter.seedDefaultsIfEmpty?.()
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
