import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { ArrowRight, Banknote, BookOpen, Headphones, Home, Info, Menu, Minus, Plus, Search, ShieldCheck, ShoppingBag, Truck, Watch, X, Zap, Eye, ArrowUpDown, Check, Tag, Sparkles, MessageCircle, FileText, RotateCcw, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { loadStoredProducts } from '@/lib/products-storage'

type Product = { id: string; name: string; nameEn: string; category: string; price: number; image: string; tag?: string; tagEn?: string; description: string; descriptionEn: string }
type CartLine = { id: string; quantity: number }
type CartItem = { product: Product; quantity: number }

// Shop WhatsApp number (international format, no + or spaces)
const WHATSAPP_NUMBER = '212610967239'

const categories = ['All', 'Phone Cases', 'Smartwatches', 'Audio', 'Jewellery', 'Sneakers', 'Chargers']
const categoryLabels: Record<string, { ar: string; en: string }> = {
  All: { ar: 'الكل', en: 'All' },
  'Phone Cases': { ar: 'أغطية الهاتف', en: 'Phone Cases' },
  Smartwatches: { ar: 'ساعات ذكية', en: 'Smartwatches' },
  Audio: { ar: 'صوتيات', en: 'Audio' },
  Jewellery: { ar: 'مجوهرات', en: 'Jewellery' },
  Sneakers: { ar: 'أحذية', en: 'Sneakers' },
  Chargers: { ar: 'شواحن', en: 'Chargers' },
}

const formatPrice = (price: number) => `${price.toLocaleString('fr-MA')} DH`

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'AR Accessories Co. — Troc, Tech & Lifestyle Maroc' }, { name: 'description', content: 'Discover thoughtfully selected accessories, jewellery, sneakers and tech with fast delivery across all cities in Morocco.' }] }),
  component: () => <ClientOnly fallback={<div className="min-h-dvh animate-pulse bg-background" />}><Storefront /></ClientOnly>,
})

function Storefront() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  // The cart only stores product ids + quantities. Names and prices always come from saved products.
  const [cartLines, setCartLines] = useState<CartLine[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('ar-cart') || '[]') as Array<{ id?: string; quantity?: number; product?: { id?: string } }>
      if (!Array.isArray(parsed)) return []
      return parsed.flatMap(item => {
        const id = item?.id ?? item?.product?.id
        const quantity = Number(item?.quantity)
        return id && Number.isFinite(quantity) && quantity > 0
          ? [{ id: String(id), quantity: Math.max(1, Math.min(99, Math.floor(quantity))) }]
          : []
      })
    } catch { return [] }
  })
  const [storeProducts, setStoreProducts] = useState<Product[]>([])
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'asc' | 'desc'>('featured')
  const [sortOpen, setSortOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalPage, setModalPage] = useState<'none' | 'privacy' | 'terms' | 'returns'>('none')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const [customer, setCustomer] = useState({ name: '', phone: '', city: '', address: '', promoCode: '' })
  const [appliedPromo, setAppliedPromo] = useState<'AR10' | 'FREESHIP' | null>(null)

  useEffect(() => { localStorage.setItem('ar-cart', JSON.stringify(cartLines)) }, [cartLines])

  // Load the products saved from /admin.
  useEffect(() => {
    let active = true
    const loadStoreProducts = async () => {
      try {
        const rows = loadStoredProducts()
        const saved = rows
          .filter(row => row.name && row.image && Number.isFinite(Number(row.price)))
          .map((row, index): Product => ({
            id: row.id || `store-${index}`,
            name: row.name,
            nameEn: row.nameEn || row.name,
            category: row.category || 'All',
            price: Number(row.price),
            image: row.image,
            tag: row.tag,
            tagEn: row.tagEn,
            description: row.description || '',
            descriptionEn: row.descriptionEn || row.description || '',
          }))
        if (active) {
          setStoreProducts(saved)
          setLoadStatus('ready')
        }
      } catch (error) {
        console.error('Failed to load products', error)
        if (active) setLoadStatus('error')
      }
    }
    void loadStoreProducts()
    return () => { active = false }
  }, [reloadKey])

  // Remove cart lines whose product no longer exists (only after a successful load)
  useEffect(() => {
    if (loadStatus !== 'ready') return
    setCartLines(current => {
      const next = current.filter(line => storeProducts.some(product => product.id === line.id))
      return next.length === current.length ? current : next
    })
  }, [loadStatus, storeProducts])

  const t = {
    ar: {
      topBanner: 'التوصيل لجميع مدن المغرب (الدار البيضاء، الرباط، مراكش، بني ملال وكل المدن)',
      shippingNotice: 'الدفع عند الاستلام (COD): أدِّ ثمن طلبيتك عند وصولها',
      shopAll: 'تسوق الكل',
      jewellery: 'مجوهرات',
      sneakers: 'أحذية',
      audio: 'صوتيات',
      searchPlaceholder: 'ابحث عن منتج، ساعة، حذاء...',
      bag: 'السلة',
      welcome: 'مرحباً بك في متجرك المفضل بالمغرب',
      heroTitle1: 'أكسسوارات، مجوهرات',
      heroTitle2: 'وتقنية عصرية.',
      heroDesc: 'توصيل سريع ومضمون لكافة مدن المملكة مع إمكانية الدفع عند الاستلام بسلامة وأمان.',
      shopNow: 'تسوق العروض الآن',
      deliveryServices: 'خدمات التوصيل',
      qualityGuarantee: 'ضمان الجودة',
      nationalDelivery: 'توصيل لجميع المدن',
      collections: 'المجموعات المتوفرة',
      chooseTaste: 'اختر ما يناسب ذوقك.',
      collectionsDesc: 'تشكيلة واسعة من المجوهرات، الأحذية، والأجهزة الذكية.',
      quickView: 'نظرة سريعة',
      loadingProducts: 'جاري تحميل المنتجات...',
      loadError: 'تعذر تحميل المنتجات حالياً.',
      loadErrorDesc: 'تحقق من الاتصال بالإنترنت وحاول مرة أخرى.',
      retry: 'إعادة المحاولة',
      noProducts: 'لا توجد منتجات حالياً.',
      addToCart: 'إضافة إلى السلة',
      continueShopping: 'متابعة التسوق',
      close: 'إغلاق',
      ourCommitment: 'التزامنا معك',
      commitmentTitle: 'توصيل سريع لكل مدن المغرب. أمان وثقة تامة.',
      codTitle: 'الدفع عند الاستلام (COD)',
      codDesc: 'ادفع ثمن طلبيتك نقداً وبكل أمان فور وصولها لباب منزلك.',
      whatsappTitle: 'تأكيد الطلب عبر واتساب',
      whatsappDesc: 'بعد إرسال طلبك نتواصل معك على واتساب لتأكيد التفاصيل وموعد التوصيل.',
      nationalCoverTitle: 'توصيل وطني شامل',
      nationalCoverDesc: 'نغطي جميع مدن وقرى المملكة المغربية بسرعة واحترافية.',
      footerDesc: 'متجرك المفضل للأكسسوارات والمجوهرات والأجهزة الذكية مع التوصيل لجميع المدن المغربية.',
      quickLinks: 'روابط سريعة',
      categoriesFooter: 'الأقسام',
      trustAndLegal: 'الثقة والقانون',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'الشروط والأحكام',
      returnPolicy: 'سياسة الشحن والاسترجاع',
      footerRights: '© 2026 AR Accessories Co. · جميع الحقوق محفوظة (التوصيل لكافة مدن المغرب).',
      cartTitle: 'سلة المشتريات',
      emptyCart: 'سلتك فارغة حالياً.',
      emptyCartDesc: 'اكتشف تشكيلتنا الواسعة وأضف ما يعجبك.',
      browseProducts: 'تصفح المنتجات',
      subtotal: 'المجموع الفرعي',
      discount: 'تخفيض الكود',
      totalAmount: 'المبلغ الإجمالي',
      checkoutBtn: 'إتمام الطلب',
      checkoutTitle: 'معلومات التوصيل',
      checkoutDesc: 'املأ بياناتك وسنتواصل معك عبر واتساب لتأكيد الطلب وتحديد موعد التوصيل.',
      codPayment: 'الدفع عند الاستلام (COD)',
      havePromo: 'هل لديك كود تخفيض؟',
      promoPlaceholder: 'أدخل الكود...',
      applyBtn: 'تطبيق',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'اسمك الكريم',
      phone: 'رقم الهاتف',
      city: 'المدينة',
      cityPlaceholder: 'مثال: بني ملال، الدار البيضاء، مراكش...',
      address: 'العنوان التفصيلي',
      addressPlaceholder: 'الحي، الشارع ورقم العمارة أو المنزل',
      confirmOrder: 'تأكيد الطلب',
      orderSuccess: 'تم تسجيل طلبك بنجاح!',
    },
    en: {
      topBanner: 'Delivery to all cities in Morocco (Casablanca, Rabat, Marrakech, Beni Mellal and all cities)',
      shippingNotice: 'Cash on Delivery (COD): pay when your order arrives',
      shopAll: 'Shop all',
      jewellery: 'Jewellery',
      sneakers: 'Sneakers',
      audio: 'Audio',
      searchPlaceholder: 'Search product, watch, sneakers...',
      bag: 'Bag',
      welcome: 'Welcome to your favorite store in Morocco',
      heroTitle1: 'Accessories, Jewellery',
      heroTitle2: '& Modern Tech.',
      heroDesc: 'Fast and reliable delivery across all cities of the Kingdom with secure cash on delivery.',
      shopNow: 'Shop Collections Now',
      deliveryServices: 'Delivery Services',
      qualityGuarantee: 'Quality Guarantee',
      nationalDelivery: 'Nationwide Delivery',
      collections: 'Available Collections',
      chooseTaste: 'Choose what fits your style.',
      collectionsDesc: 'A wide selection of jewellery, sneakers and smart devices.',
      quickView: 'Quick View',
      loadingProducts: 'Loading products...',
      loadError: 'Products could not be loaded right now.',
      loadErrorDesc: 'Check your internet connection and try again.',
      retry: 'Try again',
      noProducts: 'No products available right now.',
      addToCart: 'Add to Bag',
      continueShopping: 'Continue Shopping',
      close: 'Close',
      ourCommitment: 'Our Commitment',
      commitmentTitle: 'Fast delivery to all Moroccan cities. Total security & trust.',
      codTitle: 'Cash on Delivery (COD)',
      codDesc: 'Pay for your order in cash safely right at your doorstep.',
      whatsappTitle: 'Order confirmation on WhatsApp',
      whatsappDesc: 'After you send your order we contact you on WhatsApp to confirm the details and delivery time.',
      nationalCoverTitle: 'Nationwide Shipping',
      nationalCoverDesc: 'We cover all cities and towns across the Kingdom of Morocco swiftly.',
      footerDesc: 'Your favorite store for accessories, jewellery and smart tech with delivery across all Moroccan cities.',
      quickLinks: 'Quick Links',
      categoriesFooter: 'Categories',
      trustAndLegal: 'Trust & Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms & Conditions',
      returnPolicy: 'Shipping & Returns',
      footerRights: '© 2026 AR Accessories Co. · All rights reserved (Delivery across Morocco).',
      cartTitle: 'Shopping Bag',
      emptyCart: 'Your bag is empty.',
      emptyCartDesc: 'Explore our wide collection and add what you like.',
      browseProducts: 'Browse Products',
      subtotal: 'Subtotal',
      discount: 'Promo Discount',
      totalAmount: 'Total Amount',
      checkoutBtn: 'Proceed to Checkout',
      checkoutTitle: 'Delivery details',
      checkoutDesc: 'Enter your details and we will contact you on WhatsApp to confirm your order and delivery time.',
      codPayment: 'Cash on Delivery (COD)',
      havePromo: 'Have a promo code?',
      promoPlaceholder: 'Enter code...',
      applyBtn: 'Apply',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      phone: 'Phone Number',
      city: 'City',
      cityPlaceholder: 'Ex: Beni Mellal, Casablanca, Marrakech...',
      address: 'Detailed Address',
      addressPlaceholder: 'Neighborhood, street and building/house number',
      confirmOrder: 'Confirm Order',
      orderSuccess: 'Order request received successfully!',
    },
  }

  const currentText = t[lang]
  const categoryLabel = (value: string) => (lang === 'ar' ? categoryLabels[value]?.ar : categoryLabels[value]?.en) ?? value

  const filteredProducts = useMemo(() => {
    let result = storeProducts.filter(product =>
      (category === 'All' || product.category === category) &&
      `${product.name} ${product.nameEn} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase()),
    )

    if (sortBy === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [category, search, sortBy, storeProducts])

  // Cart items are rebuilt from saved products, so prices cannot be tampered with in localStorage.
  const cart: CartItem[] = useMemo(
    () => cartLines.flatMap(line => {
      const product = storeProducts.find(item => item.id === line.id)
      return product ? [{ product, quantity: line.quantity }] : []
    }),
    [cartLines, storeProducts],
  )

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  // The discount is derived from the current subtotal, so it stays correct when the cart changes.
  const appliedDiscount = appliedPromo === 'AR10' ? Math.round(subtotal * 0.1) : appliedPromo === 'FREESHIP' ? Math.min(50, subtotal) : 0
  const total = Math.max(0, subtotal - appliedDiscount)

  const addToCart = (product: Product) => {
    setCartLines(current => {
      const existing = current.find(line => line.id === product.id)
      return existing
        ? current.map(line => line.id === product.id ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line)
        : [...current, { id: product.id, quantity: 1 }]
    })
    toast.success(lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag', { description: lang === 'ar' ? product.name : product.nameEn })
  }

  const updateQuantity = (id: string, change: number) => setCartLines(current => current.flatMap(line => {
    if (line.id !== id) return [line]
    const quantity = Math.min(99, line.quantity + change)
    return quantity > 0 ? [{ ...line, quantity }] : []
  }))

  const applyPromo = () => {
    const code = customer.promoCode.trim().toUpperCase()
    if (code === 'AR10') {
      setAppliedPromo('AR10')
      toast.success(lang === 'ar' ? 'تم تطبيق كود التخفيض!' : 'Promo code applied!', { description: lang === 'ar' ? 'تخفيض 10% على طلبيتك.' : '10% discount added to your order.' })
    } else if (code === 'FREESHIP') {
      setAppliedPromo('FREESHIP')
      toast.success(lang === 'ar' ? 'تم تطبيق كود التخفيض!' : 'Promo code applied!', { description: lang === 'ar' ? 'تخفيض 50 درهم على طلبيتك.' : '50 DH discount added to your order.' })
    } else {
      setAppliedPromo(null)
      toast.error(lang === 'ar' ? 'كود تخفيض غير صالح' : 'Invalid promo code')
    }
  }

  const supportWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello AR Accessories Co., I need assistance with my order...')}`

  const placeOrder = async () => {
    if (busy || cart.length === 0) return
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim() || !customer.address.trim()) {
      toast.error(lang === 'ar' ? 'المرجو إتمام جميع معلومات التوصيل (بما فيها المدينة).' : 'Please complete all delivery details (including city).')
      return
    }
    if (customer.phone.replace(/\D/g, '').length < 9) {
      toast.error(lang === 'ar' ? 'المرجو إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.')
      return
    }

    const orderItems = cart.map(item =>
      `- ${lang === 'ar' ? item.product.name : item.product.nameEn} x ${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`,
    ).join('\n')
    const discountLine = appliedDiscount > 0 ? `\n${lang === 'ar' ? 'التخفيض' : 'Discount'}: -${formatPrice(appliedDiscount)}` : ''
    const waMessage = `${lang === 'ar' ? 'السلام عليكم، أريد تأكيد طلبي:' : 'Hello, I would like to confirm my order:'}

${lang === 'ar' ? 'الاسم الكامل' : 'Full name'}: ${customer.name.trim()}
${lang === 'ar' ? 'رقم الهاتف' : 'Phone'}: ${customer.phone.trim()}
${lang === 'ar' ? 'المدينة' : 'City'}: ${customer.city.trim()}
${lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed address'}: ${customer.address.trim()}

${lang === 'ar' ? 'المنتجات' : 'Products'}:
${orderItems}${discountLine}

${lang === 'ar' ? 'المبلغ الإجمالي' : 'Total'}: ${formatPrice(total)}
${lang === 'ar' ? 'طريقة الدفع: عند الاستلام (COD)' : 'Payment: Cash on Delivery (COD)'}`
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

    // Reserve the new tab right now (inside the click) so the browser does not block it after the async save below.
    const whatsappWindow = window.open('', '_blank')

    setBusy(true)
    try {
      // 1) Save the order locally before handing off to WhatsApp.
      try {
        const savedOrders = JSON.parse(localStorage.getItem('ar-orders') || '[]') as unknown
        if (!Array.isArray(savedOrders)) throw new Error('Saved orders are not in a valid format.')
        localStorage.setItem('ar-orders', JSON.stringify([...savedOrders, {
          id: crypto.randomUUID(),
          customerName: customer.name.trim(),
          phone: customer.phone.trim(),
          address: `${customer.city.trim()} - ${customer.address.trim()}`,
          itemsJson: JSON.stringify(cart.map(item => ({ id: item.product.id, name: item.product.name, quantity: item.quantity, price: item.product.price }))),
          totalAmount: total,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }]))
      } catch (error) {
        console.error('Failed to save the order; the WhatsApp order will still be sent.', error)
      }

      // 2) Then open WhatsApp.
      if (whatsappWindow) whatsappWindow.location.href = whatsappUrl
      else window.location.href = whatsappUrl

      toast.success(currentText.orderSuccess, { description: lang === 'ar' ? 'نحن نشحن بكل أمان لجميع مدن المغرب.' : 'We ship securely to all cities across Morocco.' })
      setCartLines([])
      setCartOpen(false)
      setCheckoutOpen(false)
      setCustomer({ name: '', phone: '', city: '', address: '', promoCode: '' })
      setAppliedPromo(null)
    } finally {
      setBusy(false)
    }
  }

  const sortLabels = {
    featured: lang === 'ar' ? 'الترتيب: المميز' : 'Sort: Featured',
    asc: lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High',
    desc: lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low',
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-dvh bg-background text-foreground selection:bg-primary/20 font-sans">
      {/* Floating Support WhatsApp Button */}
      <a
        href={supportWhatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact Customer Support via WhatsApp"
        className={`fixed bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#EA580C] text-white shadow-2xl ring-2 ring-[#F97316]/70 ring-offset-2 ring-offset-background transition-all duration-300 hover:scale-110 hover:ring-[#EA580C] active:scale-95 ${lang === 'ar' ? 'left-6' : 'right-6'}`}
      >
        <MessageCircle size={28}/>
      </a>

      <div className="relative bg-linear-to-r from-zinc-900 via-[#EA580C] to-zinc-900 px-4 py-2.5 text-center text-xs font-medium text-white shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={12} className="text-orange-200"/> Maroc Delivery
          </span>
          <span>{currentText.topBanner}</span>
        </div>
      </div>

      <div className="flex min-h-9 items-center justify-between gap-2 bg-secondary/80 border-b border-border/60 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        <div className="mx-auto flex items-center gap-2">
          <Truck size={14} className="text-primary"/> {currentText.shippingNotice}
        </div>
        <button
          onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold text-foreground transition hover:border-primary active:scale-95 shadow-sm"
        >
          <Globe size={13} className="text-primary"/>
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-19 max-w-7xl items-center gap-5 px-4 sm:px-8">
          <button
            type="button"
            aria-label={lang === 'ar' ? 'فتح القائمة' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary active:scale-95 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <a href="#home" className="flex shrink-0 items-center gap-2 transition-transform duration-200 active:scale-95" aria-label="AR Accessories Co. home">
            <img src="/icon.png" alt="" className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.45)] sm:h-12" />
            <span className="flex flex-col gap-0.5">
              <span className="text-2xl font-black uppercase leading-none tracking-wider text-foreground dark:text-white sm:text-3xl">AR</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-gray-300 sm:text-xs">ACCESSORIES CO</span>
            </span>
          </a>
          <nav className={`hidden items-center gap-7 text-xs font-medium text-muted-foreground lg:flex ${lang === 'ar' ? 'mr-5' : 'ml-5'}`}>
            <a className="transition hover:text-foreground active:scale-95" href="#collection">{currentText.shopAll}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Jewellery')}>{currentText.jewellery}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Sneakers')}>{currentText.sneakers}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Audio')}>{currentText.audio}</a>
          </nav>
          <label className="mx-auto hidden h-10 max-w-sm flex-1 items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-4 md:flex transition-all focus-within:border-primary">
            <Search size={16} className="shrink-0 text-muted-foreground"/>
            <input aria-label="Search products" value={search} onChange={event => setSearch(event.target.value)} placeholder={currentText.searchPlaceholder} className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"/>
          </label>
          <button aria-label={`Open shopping bag, ${itemCount} items`} onClick={() => setCartOpen(true)} className={`flex h-10 items-center gap-2 rounded-full border border-border px-3.5 text-sm transition-all duration-200 hover:border-primary hover:text-primary active:scale-95 ${lang === 'ar' ? 'mr-auto md:mr-0' : 'ml-auto md:ml-0'}`}>
            <ShoppingBag size={17}/><span className="hidden sm:inline">{currentText.bag}</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{itemCount}</span>
          </button>
          <a href="/admin" aria-label={lang === 'ar' ? 'إدارة المتجر' : 'Store admin'} title={lang === 'ar' ? 'إدارة المتجر' : 'Store admin'} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary active:scale-95">
            <ShieldCheck size={17}/>
          </a>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        id="mobile-navigation-drawer"
        aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Mobile navigation'}
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[min(84vw,22rem)] flex-col bg-background text-foreground shadow-2xl transition-transform duration-300 ease-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex min-h-20 items-center justify-between gap-3 border-b border-[#EA580C]/30 bg-[#F97316] px-5 text-white">
          <h2 className="text-sm font-bold tracking-[0.08em]">
            {lang === 'ar' ? 'قائمة التنقل' : 'MENU DE NAVIGATION'}
          </h2>
          <button
            type="button"
            aria-label={lang === 'ar' ? 'إغلاق القائمة' : 'Close navigation menu'}
            onClick={() => setMobileMenuOpen(false)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/20 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="grid gap-1 p-4">
          <a href="#home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <Home size={18} className="text-primary" />
            {lang === 'ar' ? 'الرئيسية (Accueil)' : 'Home (Accueil)'}
          </a>
          <a href={supportWhatsappUrl} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <MessageCircle size={18} className="text-primary" />
            {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </a>
          <a href="#promise" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <Info size={18} className="text-primary" />
            {lang === 'ar' ? 'من نحن' : 'About Us'}
          </a>
          <button type="button" onClick={() => { setMobileMenuOpen(false); setModalPage('privacy') }} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <ShieldCheck size={18} className="text-primary" />
            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
          <a href="#collection" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <BookOpen size={18} className="text-primary" />
            {lang === 'ar' ? 'المدونة والأقسام' : 'Blog / Categories'}
          </a>
        </nav>
      </aside>

      <section id="home" className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:py-14">
        <div className="order-2 py-3 lg:order-1 lg:py-10">
          <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary"><span className="h-px w-7 bg-primary"/>{currentText.welcome}</p>
          <h1 className="max-w-xl font-serif text-[clamp(2.8rem,6vw,5.4rem)] leading-[0.98] tracking-tighter">{currentText.heroTitle1}<br/><span className="italic text-foreground">{currentText.heroTitle2}</span></h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">{currentText.heroDesc}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#collection" className="inline-flex h-12 items-center gap-3 rounded-full bg-linear-to-r from-orange-500 to-amber-600 px-6 text-xs font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-95">{currentText.shopNow} <ArrowRight size={15}/></a>
            <a href="#promise" className="rounded-full px-4 py-3 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground active:scale-95">{currentText.deliveryServices}</a>
          </div>
          <div className="mt-9 flex items-center gap-5 border-t border-border pt-5 text-[10px] font-medium uppercase tracking-[0.13em] text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-primary"/> {currentText.qualityGuarantee}</span>
            <span className="h-4 w-px bg-border"/>
            <span className="flex items-center gap-2"><Truck size={14} className="text-primary"/> {currentText.nationalDelivery}</span>
          </div>
        </div>
        <div className="group relative order-1 min-h-75 overflow-hidden rounded-[1.4rem] bg-secondary sm:min-h-107.5 lg:order-2 lg:min-h-130">
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=90" alt="Luxury jewellery and lifestyle accessories" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"/>
          <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/5 to-transparent"/>
          <span className={`absolute top-5 rounded-full border border-white/35 bg-primary/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm ${lang === 'ar' ? 'left-5' : 'right-5'}`}>Maroc Shipping</span>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/75">High Quality</p>
              <p className="max-w-xs font-serif text-2xl leading-tight sm:text-3xl">{lang === 'ar' ? 'طلبيتك توصلك حتى لدارك.' : 'Delivered right to your door.'}</p>
            </div>
            <a href="#collection" aria-label="Shop the collection" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground transition-all duration-200 hover:scale-105 active:scale-90"><ArrowRight size={18}/></a>
          </div>
        </div>
      </section>

      <section id="collection" className="border-y border-border bg-secondary/45 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{currentText.collections}</p>
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">{currentText.chooseTaste}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{currentText.collectionsDesc}</p>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
              {categories.map(item => (
                <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${category === item ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card hover:border-primary hover:text-primary'}`}>
                  {categoryLabel(item)}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 self-start lg:self-auto">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold transition-all hover:border-primary active:scale-95 text-foreground shadow-sm"
              >
                <ArrowUpDown size={13} className="text-primary"/>
                <span>{sortLabels[sortBy]}</span>
              </button>

              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className={`absolute top-full z-50 mt-2 w-52 rounded-2xl border border-border/80 bg-card p-1.5 shadow-2xl backdrop-blur-md animate-scale-up ${lang === 'ar' ? 'right-0' : 'left-0'}`}>
                    {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map(key => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setSortOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-[11px] font-medium transition-colors ${sortBy === key ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground hover:bg-secondary'}`}
                      >
                        <span>{sortLabels[key]}</span>
                        {sortBy === key && <Check size={13}/>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <label className="mt-5 flex h-11 items-center gap-3 rounded-full border border-border bg-background px-4 md:hidden transition-all focus-within:border-primary">
            <Search size={16} className="text-muted-foreground"/>
            <input aria-label="Search products" value={search} onChange={event => setSearch(event.target.value)} placeholder={currentText.searchPlaceholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
          </label>

          {loadStatus === 'loading' && (
            <p className="mt-10 text-center text-sm text-muted-foreground">{currentText.loadingProducts}</p>
          )}

          {loadStatus === 'error' && (
            <div className="mt-6 rounded-xl border border-dashed border-border py-14 text-center">
              <p className="font-serif text-2xl">{currentText.loadError}</p>
              <p className="mt-2 text-sm text-muted-foreground">{currentText.loadErrorDesc}</p>
              <button
                onClick={() => { setLoadStatus('loading'); setReloadKey(key => key + 1) }}
                className="mt-5 rounded-full bg-linear-to-r from-orange-500 to-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-95"
              >
                {currentText.retry}
              </button>
            </div>
          )}

          {loadStatus === 'ready' && (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="relative aspect-[0.91] overflow-hidden bg-secondary cursor-pointer"
                    title="Click to view product details"
                  >
                    <img src={product.image} alt={lang === 'ar' ? product.name : product.nameEn} loading={index > 3 ? 'lazy' : 'eager'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"/>
                    {(product.tag || product.tagEn) && <span className={`absolute top-3 rounded-full bg-background/90 px-2.5 py-1 text-[8px] font-bold tracking-[0.12em] text-foreground backdrop-blur ${lang === 'ar' ? 'left-3' : 'right-3'}`}>{lang === 'ar' ? product.tag : product.tagEn}</span>}

                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                      <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-md backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye size={13} className="text-primary"/> {currentText.quickView}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{categoryLabel(product.category)}</p>
                    <h3 onClick={() => setSelectedProduct(product)} className="min-h-10 text-sm font-semibold leading-5 cursor-pointer hover:text-primary transition-colors">{lang === 'ar' ? product.name : product.nameEn}</h3>
                    <div className="mt-3 flex items-center justify-between gap-1">
                      <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                      <button onClick={() => addToCart(product)} aria-label="Add product to cart" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md transition-transform duration-200 hover:scale-110 hover:brightness-105 active:scale-90"><Plus size={17}/></button>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{lang === 'ar' ? product.description : product.descriptionEn}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {loadStatus === 'ready' && filteredProducts.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-border py-14 text-center">
              <p className="font-serif text-2xl">{storeProducts.length === 0 ? currentText.noProducts : (lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching results.')}</p>
              {storeProducts.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{lang === 'ar' ? 'جرب البحث بكلمة أخرى أو تصفح قسم مختلف.' : 'Try searching with another keyword or category.'}</p>}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/45 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-background shadow-2xl border border-border/80 grid md:grid-cols-2 animate-scale-up">
            <button aria-label="Close modal" onClick={() => setSelectedProduct(null)} className={`absolute top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-md shadow-md transition-all hover:bg-muted active:scale-90 ${lang === 'ar' ? 'left-4' : 'right-4'}`}><X size={18}/></button>
            <div className="relative aspect-square bg-secondary overflow-hidden">
              <img src={selectedProduct.image} alt="" className="h-full w-full object-cover"/>
              {(selectedProduct.tag || selectedProduct.tagEn) && <span className={`absolute top-4 rounded-full bg-background/90 px-3 py-1 text-[9px] font-bold tracking-[0.12em] text-foreground backdrop-blur ${lang === 'ar' ? 'left-4' : 'right-4'}`}>{lang === 'ar' ? selectedProduct.tag : selectedProduct.tagEn}</span>}
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">{categoryLabel(selectedProduct.category)}</p>
                <h3 className="font-serif text-2xl sm:text-3xl leading-tight mb-3">{lang === 'ar' ? selectedProduct.name : selectedProduct.nameEn}</h3>
                <p className="text-xl font-bold mb-4 text-primary">{formatPrice(selectedProduct.price)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">{lang === 'ar' ? selectedProduct.description : selectedProduct.descriptionEn}</p>
              </div>
              <div className="space-y-2.5">
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-amber-600 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-105 active:scale-95">
                  <ShoppingBag size={16}/> {currentText.addToCart}
                </button>
                <button onClick={() => setSelectedProduct(null)} className="flex h-10 w-full items-center justify-center rounded-full border border-border text-xs font-semibold transition-all duration-200 hover:border-primary active:scale-95">
                  {currentText.continueShopping}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalPage !== 'none' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/45 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setModalPage('none')}>
          <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-3xl bg-background p-6 shadow-2xl border border-border/80 animate-scale-up">
            <button aria-label="Close modal" onClick={() => setModalPage('none')} className={`absolute top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition-all hover:bg-muted active:scale-90 ${lang === 'ar' ? 'left-4' : 'right-4'}`}><X size={16}/></button>
            {modalPage === 'privacy' ? (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-primary"><ShieldCheck size={20}/> {currentText.privacyPolicy}</h3>
                {lang === 'ar' ? (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">نحترم خصوصيتك. المتجر يحفظ المنتجات والسلة وطلباتك في مساحة التخزين المحلية لهذا المتصفح لتسهيل استخدام الموقع؛ لا تتم مزامنتها بين الأجهزة.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">عند تأكيد الطلب، نفتح واتساب برسالة تحتوي على معلومات التوصيل والمنتجات التي اخترتها لإرسالها إلينا. لا تدخل معلومات لا ترغب في مشاركتها عبر واتساب.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">يمكنك حذف البيانات المحلية بمسح بيانات الموقع من إعدادات المتصفح. حذفها لا يمحو الرسائل التي أرسلتها عبر واتساب.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">We respect your privacy. This store saves products, your cart, and orders in this browser's local storage to support the shopping experience; this data is not synced across devices.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">When you confirm an order, WhatsApp opens with a message containing your delivery details and selected products for you to send to us. Do not include information you do not want to share through WhatsApp.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">You can remove locally stored data by clearing this site's data in your browser settings. This does not delete messages you have sent through WhatsApp.</p>
                  </>
                )}
              </div>
            ) : modalPage === 'terms' ? (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-primary"><FileText size={20}/> {currentText.termsOfService}</h3>
                {lang === 'ar' ? (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">باستخدامك هذا المتجر، فإنك توافق على تقديم معلومات صحيحة عند الطلب والتواصل معنا لتأكيد تفاصيل التوصيل.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">تُعرض الأسعار بالدرهم المغربي. يتم تأكيد توفر المنتجات والسعر النهائي وتفاصيل الطلب عبر واتساب قبل الشحن، والدفع نقداً عند الاستلام.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">تُبذل العناية لضمان دقة أوصاف وصور المنتجات، وقد تختلف الألوان قليلاً حسب الشاشة. نحتفظ بحق تصحيح الأخطاء الواضحة في المعلومات المعروضة.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">By using this store, you agree to provide accurate order information and communicate with us to confirm delivery details.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Prices are displayed in Moroccan dirhams. Product availability, the final price, and order details are confirmed through WhatsApp before shipping. Payment is due in cash on delivery.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">We take care to keep product descriptions and images accurate, though colors may vary by screen. We reserve the right to correct clear errors in displayed information.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-primary"><RotateCcw size={20}/> {currentText.returnPolicy}</h3>
                {lang === 'ar' ? (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">نوفر التوصيل إلى مدن المغرب، ونتواصل معك عبر واتساب لتأكيد الطلب وموعد التوصيل. الدفع نقداً عند الاستلام.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">إذا وصل منتج به عيب مصنعي أو استلمت منتجاً غير مطابق لطلبك، تواصل معنا خلال 7 أيام من الاستلام عبر واتساب مع رقم الطلب وصور توضح المشكلة، وسننسق معك بشأن الاستبدال أو الاسترجاع.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">يرجى الاحتفاظ بالمنتج وتغليفه بحالتهما الأصلية إلى حين التواصل معنا. تتم معالجة الطلبات بعد مراجعة الحالة وتأكيد التفاصيل.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">We deliver across Moroccan cities and contact you through WhatsApp to confirm your order and delivery timing. Payment is cash on delivery.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">If an item arrives with a manufacturing defect or does not match your order, contact us through WhatsApp within 7 days of delivery with your order details and photos showing the issue. We will coordinate an exchange or return with you.</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Please keep the item and its packaging in their original condition while you contact us. Requests are handled after we review the issue and confirm the details.</p>
                  </>
                )}
              </div>
            )}
            <button onClick={() => setModalPage('none')} className="mt-6 w-full rounded-full bg-linear-to-r from-orange-500 to-amber-600 py-3 text-xs font-bold text-white shadow-md transition hover:brightness-105">{currentText.close}</button>
          </div>
        </div>
      )}

      <section id="promise" className="mx-auto grid max-w-7xl gap-7 px-4 py-12 sm:px-8 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center border-t border-border/80">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{currentText.ourCommitment}</p>
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{currentText.commitmentTitle}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[{ icon: Banknote, title: currentText.codTitle, body: currentText.codDesc }, { icon: MessageCircle, title: currentText.whatsappTitle, body: currentText.whatsappDesc }, { icon: Truck, title: currentText.nationalCoverTitle, body: currentText.nationalCoverDesc }].map(item => (
            <div key={item.title} className="border-t border-border pt-4">
              <item.icon size={19} className="mb-3 text-primary"/>
              <h3 className="text-xs font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-zinc-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-8 md:grid-cols-[1fr_auto_auto_auto] md:items-start">
          <div>
            <a href="#home" className="inline-flex items-center gap-2.5 transition-transform duration-200 active:scale-95">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F97316] p-1">
                <img src="/icon.png" alt="" className="h-8 w-auto object-contain" />
              </span>
            </a>
            <p className="mt-3 max-w-xs text-xs leading-5 text-white/75">{currentText.footerDesc}</p>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">{currentText.quickLinks}</p>
            <div className="grid gap-2 text-xs">
              <a className="transition hover:text-[#F97316] hover:underline active:scale-95" href="#collection">{currentText.shopAll}</a>
              <a className="transition hover:text-[#F97316] hover:underline active:scale-95" href="#promise">{currentText.deliveryServices}</a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">{currentText.categoriesFooter}</p>
            <div className="grid gap-2 text-xs">
              <a className="transition hover:text-[#F97316] hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Jewellery')}><span className="inline-flex items-center gap-2"><Watch size={13}/> {currentText.jewellery}</span></a>
              <a className="transition hover:text-[#F97316] hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Sneakers')}><span className="inline-flex items-center gap-2"><Zap size={13}/> {currentText.sneakers}</span></a>
              <a className="transition hover:text-[#F97316] hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Audio')}><span className="inline-flex items-center gap-2"><Headphones size={13}/> {currentText.audio}</span></a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">{currentText.trustAndLegal}</p>
            <div className="grid gap-2 text-xs">
              <button onClick={() => setModalPage('privacy')} className="text-left transition hover:text-[#F97316] hover:underline active:scale-95">{currentText.privacyPolicy}</button>
              <button onClick={() => setModalPage('terms')} className="text-left transition hover:text-[#F97316] hover:underline active:scale-95">{currentText.termsOfService}</button>
              <button onClick={() => setModalPage('returns')} className="text-left transition hover:text-[#F97316] hover:underline active:scale-95">{currentText.returnPolicy}</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 py-4 text-center text-[9px] text-white/65">{currentText.footerRights}</div>
        <div className="pb-4 text-center text-[10px] text-white/65">
          Designed &amp; Developed by{' '}
          <a
            href="https://wa.me/212693222558?text=Bonjour%20MICO%2C%20je%20souhaite%20cr%C3%A9er%20un%20site%20web%20comme%20AR%20Accessories"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-orange-400 transition-colors hover:underline"
          >
            MICO
          </a>
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Close shopping bag" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"/>
          <aside aria-label="Shopping bag" className={`relative flex h-full w-full max-w-md flex-col bg-background shadow-xl ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">{currentText.cartTitle} <span className="text-xs text-muted-foreground">({itemCount})</span></h2>
              </div>
              <button aria-label="Close shopping bag" onClick={() => setCartOpen(false)} className="rounded-full p-2 transition hover:bg-muted active:scale-90"><X size={18}/></button>
            </div>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary"><ShoppingBag size={24}/></span>
                <p className="font-serif text-2xl">{currentText.emptyCart}</p>
                <p className="mt-2 text-sm text-muted-foreground">{currentText.emptyCartDesc}</p>
                <button onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-linear-to-r from-orange-500 to-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-transform duration-200 hover:brightness-105 active:scale-95">{currentText.browseProducts}</button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 border-b border-border pb-4">
                      <img src={item.product.image} alt="" className="h-24 w-20 rounded-xl object-cover"/>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-sm font-semibold">{lang === 'ar' ? item.product.name : item.product.nameEn}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.product.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-border">
                            <button aria-label="Remove one" onClick={() => updateQuantity(item.product.id, -1)} className="p-2 active:scale-75 transition-transform"><Minus size={12}/></button>
                            <span className="min-w-4 text-center text-xs">{item.quantity}</span>
                            <button aria-label="Add one" onClick={() => updateQuantity(item.product.id, 1)} className="p-2 active:scale-125 transition-transform"><Plus size={12}/></button>
                          </div>
                          <b className="text-sm">{formatPrice(item.product.price * item.quantity)}</b>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border p-5">
                  <div className="space-y-1.5 mb-3 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>{currentText.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
                    {appliedDiscount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>{currentText.discount}</span><span>-{formatPrice(appliedDiscount)}</span></div>}
                    <div className="flex justify-between text-base font-bold pt-1 border-t border-border"><span>{currentText.totalAmount}</span><span>{formatPrice(total)}</span></div>
                  </div>
                  <button onClick={() => { setCartOpen(false); setCheckoutOpen(true) }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-amber-600 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-105 active:scale-95">{currentText.checkoutBtn} <ArrowRight size={15}/></button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4 backdrop-blur-sm" onClick={() => setCheckoutOpen(false)}>
          <section role="dialog" aria-modal="true" onClick={event => event.stopPropagation()} className="checkout-scrollbar-hidden max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-background p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">Secure Checkout</p>
                <h2 className="mt-1 font-serif text-3xl">{currentText.checkoutTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{currentText.checkoutDesc}</p>
              </div>
              <button aria-label="Close checkout" onClick={() => setCheckoutOpen(false)} className="rounded-full p-2 hover:bg-muted active:scale-90 transition-transform"><X size={17}/></button>
            </div>

            <style>{`
              .checkout-scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
              .checkout-scrollbar-hidden::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="space-y-4">
              {/* Payment: Cash on Delivery only */}
              <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/10 p-3 text-primary">
                <Banknote size={18} className="shrink-0"/>
                <div>
                  <p className="text-xs font-semibold">{currentText.codPayment}</p>
                  <p className="mt-0.5 text-[11px] text-primary/80">{currentText.codDesc}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2">
                <span className="text-xs font-semibold flex items-center gap-1.5"><Tag size={13} className="text-primary"/> {currentText.havePromo}</span>
                <div className="flex gap-2">
                  <input value={customer.promoCode} onChange={event => setCustomer(current => ({ ...current, promoCode: event.target.value }))} placeholder={currentText.promoPlaceholder} className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-xs uppercase outline-none focus:border-primary"/>
                  <button type="button" onClick={applyPromo} className="h-10 rounded-xl bg-linear-to-r from-orange-500 to-amber-600 px-4 text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-95">{currentText.applyBtn}</button>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.fullName}</span>
                  <input value={customer.name} onChange={event => setCustomer(current => ({ ...current, name: event.target.value }))} placeholder={currentText.fullNamePlaceholder} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.phone}</span>
                  <input type="tel" inputMode="tel" value={customer.phone} onChange={event => setCustomer(current => ({ ...current, phone: event.target.value }))} placeholder="+212 6XX XXX XXX" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.city}</span>
                  <input value={customer.city} onChange={event => setCustomer(current => ({ ...current, city: event.target.value }))} placeholder={currentText.cityPlaceholder} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.address}</span>
                  <input value={customer.address} onChange={event => setCustomer(current => ({ ...current, address: event.target.value }))} placeholder={currentText.addressPlaceholder} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
                </label>
              </div>
            </div>

            <div className="my-5 rounded-xl bg-secondary p-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground"><span>{currentText.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
              {appliedDiscount > 0 && <div className="flex justify-between text-xs text-emerald-600 font-medium"><span>{currentText.discount}</span><span>-{formatPrice(appliedDiscount)}</span></div>}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/60"><span>{currentText.totalAmount}</span><span>{formatPrice(total)}</span></div>
            </div>

            <button disabled={busy} onClick={placeOrder} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-amber-600 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-105 active:scale-95 disabled:opacity-65">
              {currentText.confirmOrder} <ArrowRight size={15}/>
            </button>
          </section>
        </div>
      )}
    </div>
  )
}