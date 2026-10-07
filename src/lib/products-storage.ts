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

export const DEFAULT_PRODUCTS: StoredProduct[] = [
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
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream', 'Olive'],
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
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Beige'],
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
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Olive', 'Navy'],
  },
]

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
  if (!stored?.trim()) {
    saveStoredProducts(DEFAULT_PRODUCTS)
    return DEFAULT_PRODUCTS
  }

  const parsed: unknown = JSON.parse(stored)
  if (!Array.isArray(parsed)) {
    throw new Error('Saved products are not in a valid format.')
  }

  const products = parsed.filter(isStoredProduct)
  if (products.length === 0) {
    saveStoredProducts(DEFAULT_PRODUCTS)
    return DEFAULT_PRODUCTS
  }

  return products
}

export function saveStoredProducts(products: StoredProduct[]) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
}
