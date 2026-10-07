export const PRODUCTS_STORAGE_KEY = 'ar-products'

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
  createdAt?: string
}

function isStoredProduct(value: unknown): value is StoredProduct {
  if (typeof value !== 'object' || value === null) return false
  const product = value as Record<string, unknown>
  return typeof product.id === 'string'
    && typeof product.name === 'string'
    && typeof product.image === 'string'
    && Number.isFinite(Number(product.price))
}

export function loadStoredProducts(): StoredProduct[] {
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY)
  if (!stored) return []

  const parsed: unknown = JSON.parse(stored)
  if (!Array.isArray(parsed)) {
    throw new Error('Saved products are not in a valid format.')
  }

  return parsed.filter(isStoredProduct)
}

export function saveStoredProducts(products: StoredProduct[]) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
}
