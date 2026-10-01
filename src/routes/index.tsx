import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Banknote, CreditCard, Headphones, Minus, Plus, Search, ShieldCheck, ShoppingBag, Truck, Watch, X, Zap, Eye, Star, Quote, ArrowUpDown, Check, Tag, Sparkles, MessageCircle, FileText, RotateCcw, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { blink } from '@/blink/client'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import type { OrdersRow } from '@/lib/db-types'

type Product = { id: string; name: string; nameEn: string; category: string; price: number; image: string; tag?: string; tagEn?: string; description: string; descriptionEn: string }
type CartItem = { product: Product; quantity: number }
type StoreProductRow = { id: string; userId?: string; name: string; nameEn?: string; category?: string; price: number; stock?: number; image: string; tag?: string; tagEn?: string; description?: string; descriptionEn?: string }

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
const products: Product[] = [
  { 
    id: 'case-01', 
    name: 'Everyday Mag Case', 
    nameEn: 'Everyday Mag Case',
    category: 'Phone Cases', 
    price: 249, 
    image: 'https://images.unsplash.com/photo-1601592690120-a7cefd9c477a?auto=format&fit=crop&w=900&q=85', 
    tag: 'الأكثر مبيعا', 
    tagEn: 'BESTSELLER', 
    description: 'كوري سليم وحامي مع لمسة مطفية مريحة للاستعمال اليومي.', 
    descriptionEn: 'A slim, protective case with a clean matte finish and a comfortable grip for your daily carry.' 
  },
  { 
    id: 'watch-01', 
    name: 'ساعة ذكية نشطة', 
    nameEn: 'Active Smartwatch',
    category: 'Smartwatches', 
    price: 899, 
    image: 'https://images.unsplash.com/photo-1750776100861-30c172651817?auto=format&fit=crop&w=900&q=85', 
    tag: 'جديد', 
    tagEn: 'JUST IN', 
    description: 'ساعة يومية متعددة الاستخدامات بشاشة واضحة وتتبع للنشاط طوال اليوم.', 
    descriptionEn: 'A versatile everyday watch with a crisp display, activity tracking and a comfortable all-day band.' 
  },
  { 
    id: 'jewel-01', 
    name: 'سوار معدني مينيمالست', 
    nameEn: 'Minimalist Steel Bracelet',
    category: 'Jewellery', 
    price: 349, 
    image: 'https://images.unsplash.com/photo-1611591475871-2ee8ab22349a?auto=format&fit=crop&w=900&q=85', 
    tag: 'رائج', 
    tagEn: 'TRENDING', 
    description: 'مصمم خصيصاً لأناقة يومية راقية من الستانلس ستيل.', 
    descriptionEn: 'Crafted for men and women, a sleek stainless steel bracelet designed for daily elegance.' 
  },
  { 
    id: 'jewel-02', 
    name: 'خاتم فضي كلاسيكي', 
    nameEn: 'Silver Signet Ring',
    category: 'Jewellery', 
    price: 299, 
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85', 
    description: 'خاتم فضي مصقول بأسلوب كلاسيكي هادئ وراقي.', 
    descriptionEn: 'A classic polished silver ring suited for a refined, understated look.' 
  },
  { 
    id: 'sneaker-01', 
    name: 'حذاء جلدي عصري', 
    nameEn: 'Urban Leather Sneaker',
    category: 'Sneakers', 
    price: 1199, 
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85', 
    tag: 'جديد', 
    tagEn: 'NEW', 
    description: 'أحذية جلدية فاخرة تجمع بين الراحة القصوى والتصميم الحضري النظيف.', 
    descriptionEn: 'Premium leather sneakers combining ultimate comfort with clean urban styling.' 
  },
  { 
    id: 'audio-01', 
    name: 'سماعات استوديو برو', 
    nameEn: 'Studio Buds Pro',
    category: 'Audio', 
    price: 549, 
    image: 'https://images.unsplash.com/photo-1600375104627-c94c416deefa?auto=format&fit=crop&w=900&q=85', 
    tag: 'اختيار مميز', 
    tagEn: 'TOP PICK', 
    description: 'سماعات لاسلكية مدمجة لمكالمات واضحة وصوت غني.', 
    descriptionEn: 'Compact wireless earbuds made for clear calls, rich sound and a pocket-friendly commute.' 
  },
  { 
    id: 'sneaker-02', 
    name: 'سبادريل الجري الكلاسيكي', 
    nameEn: 'Classic Runner Spadril',
    category: 'Sneakers', 
    price: 899, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', 
    description: 'حذاء رياضي خفيف مصمم للتمارين اليومية والمظهر العصري السهل.', 
    descriptionEn: 'Lightweight sports sneakers engineered for daily workouts and effortless street style.' 
  },
  { 
    id: 'charger-01', 
    name: 'شاحن مكتب مغناطيسي', 
    nameEn: 'Magnetic Desk Charger',
    category: 'Chargers', 
    price: 329, 
    image: 'https://images.unsplash.com/photo-1642418714495-87fcca453f70?auto=format&fit=crop&w=900&q=85', 
    description: 'رفيق شحن أنيق يحافظ على طاقة أجهزتك ومكتبك منظماً.', 
    descriptionEn: 'A streamlined charging companion that keeps your everyday devices powered and your desk tidy.' 
  },
]

const reviews = [
  { id: 1, name: 'يوسف ب.', nameEn: 'Youssef B.', city: 'الدار البيضاء', cityEn: 'Casablanca', comment: 'السلعة وصلتني فالصباح، الجودة ناضية بزاف شكرا!', commentEn: 'Received my order in the morning, amazing quality thanks!', rating: 5 },
  { id: 2, name: 'أيمن م.', nameEn: 'Aymen M.', city: 'الرباط', cityEn: 'Rabat', comment: 'التوصيل سريع لجميع المدن وخديت Cash on Delivery بدون مشاكل.', commentEn: 'Fast delivery to all cities and smooth Cash on Delivery.', rating: 5 },
  { id: 3, name: 'كنزة ل.', nameEn: 'Kenza L.', city: 'مراكش', cityEn: 'Marrakech', comment: 'خدمة العملاء روعة والتوصيل مضمون 100% في كل المغرب.', commentEn: 'Top customer service and 100% reliable delivery across Morocco.', rating: 5 },
]

const formatPrice = (price: number) => `${price.toLocaleString('fr-MA')} DH`

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'AR Accessories Co. — Troc, Tech & Lifestyle Maroc' }, { name: 'description', content: 'Discover thoughtfully selected accessories, jewellery, sneakers and tech with fast delivery across all cities in Morocco.' }] }),
  component: () => <BlinkClientBoundary fallback={<div className="min-h-dvh animate-pulse bg-background" />}><Storefront /></BlinkClientBoundary>,
})

function Storefront() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('ar-cart') || '[]') as CartItem[]
      return Array.isArray(parsed)
        ? parsed.filter(item => item?.product?.id && Number.isFinite(item.quantity) && item.quantity > 0)
        : []
    } catch { return [] }
  })
  const [storeProducts, setStoreProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'asc' | 'desc'>('featured')
  const [sortOpen, setSortOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalPage, setModalPage] = useState<'none' | 'terms' | 'returns'>('none')
  const [busy, setBusy] = useState(false)
  
  // Optional Payment Gateway configuration
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cmi'>('cod')
  const [customer, setCustomer] = useState({ name: '', phone: '', city: '', address: '', promoCode: '' })
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [card, setCard] = useState({ cardholder: '', number: '', expiry: '', cvv: '' })
  const [cardIsFlipped, setCardIsFlipped] = useState(false)
  const [gatewayStep, setGatewayStep] = useState<'details' | 'processing' | 'success'>('details')
  const orderReference = ''
  const paymentAudioContext = useRef<AudioContext | null>(null)

  const triggerPaymentFeedback = (kind: 'flip' | 'success') => {
    // Vibration is supported by some mobile browsers; Web Audio is the fallback.
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(kind === 'flip' ? 14 : [22, 36, 52])
      }
    } catch { /* Haptics are optional and may be blocked by the browser. */ }

    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return
    try {
      const context = paymentAudioContext.current ?? new window.AudioContext()
      paymentAudioContext.current = context
      if (context.state === 'suspended') void context.resume().catch(() => {})

      const now = context.currentTime
      const tones = kind === 'flip'
        ? [{ frequency: 690, start: 0, duration: 0.075, volume: 0.035 }]
        : [{ frequency: 660, start: 0, duration: 0.11, volume: 0.04 }, { frequency: 880, start: 0.105, duration: 0.16, volume: 0.045 }]

      tones.forEach(tone => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(tone.frequency, now + tone.start)
        gain.gain.setValueAtTime(0.0001, now + tone.start)
        gain.gain.exponentialRampToValueAtTime(tone.volume, now + tone.start + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(now + tone.start)
        oscillator.stop(now + tone.start + tone.duration + 0.01)
      })
    } catch { /* Keep checkout usable when audio is unavailable or disallowed. */ }
  }

  useEffect(() => { localStorage.setItem('ar-cart', JSON.stringify(cart)) }, [cart])

  // Load products saved from /admin. Built-in demo products are the fallback if the DB read fails.
  useEffect(() => {
    let active = true
    const loadStoreProducts = async () => {
      try {
        const rows = await blink.db.table<StoreProductRow>('products').list({ limit: 200 })
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
        if (active) setStoreProducts(saved)
      } catch (error) {
        console.error('Failed to load products', error)
        if (active) setStoreProducts(products)
      }
    }
    void loadStoreProducts()
    return () => { active = false }
  }, [])

  const t = {
    ar: {
      topBanner: 'التوصيل لجميع مدن المغرب (الدار البيضاء، الرباط، مراكش، بني ملال وكل المدن)',
      shippingNotice: 'الدفع عند الاستلام (COD) أو الأداء بالبطاقة (CMI)',
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
      customerReviews: 'آراء الزبناء',
      reviewsTitle: 'ثقة زبنائنا في كل المدن.',
      reviewsDesc: 'تعرف على تجارب زبنائنا الكرام مع خدماتنا.',
      addToCart: 'إضافة إلى السلة',
      continueShopping: 'متابعة التسوق',
      close: 'إغلاق',
      ourCommitment: 'التزامنا معك',
      commitmentTitle: 'توصيل سريع لكل مدن المغرب. أمان وثقة تامة.',
      codTitle: 'الدفع عند الاستلام (COD)',
      codDesc: 'ادفع ثمن طلبيتك نقداً وبكل أمان فور وصولها لباب منزلك.',
      onlinePayTitle: 'بوابة الدفع الإلكتروني (CMI)',
      onlinePayDesc: 'اختر الأداء أونلاين عبر بوابة CMI الآمنة بالبطاقة البنكية.',
      nationalCoverTitle: 'توصيل وطني شامل',
      nationalCoverDesc: 'نغطي جميع مدن وقرى المملكة المغربية بسرعة واحترافية.',
      footerDesc: 'متجرك المفضل للأكسسوارات والمجوهرات والأجهزة الذكية مع التوصيل لجميع المدن المغربية.',
      quickLinks: 'روابط سريعة',
      categoriesFooter: 'الأقسام',
      trustAndLegal: 'الثقة والقانون',
      termsOfService: 'شروط الخدمة',
      returnPolicy: 'سياسة الاسترجاع',
      footerRights: '©️ 2026 AR Accessories Co. · جميع الحقوق محفوظة (التوصيل لكافة مدن المغرب).',
      cartTitle: 'سلة المشتريات',
      emptyCart: 'سلتك فارغة حالياً.',
      emptyCartDesc: 'اكتشف تشكيلتنا الواسعة وأضف ما يعجبك.',
      browseProducts: 'تصفح المنتجات',
      subtotal: 'المجموع الفرعي',
      discount: 'تخفيض الكود',
      totalAmount: 'المبلغ الإجمالي',
      checkoutBtn: 'إتمام الطلب',
      checkoutTitle: 'معلومات التوصيل والدفع',
      checkoutDesc: 'اختر طريقة الدفع المناسبة لك (اختياري) واملأ بياناتك لتصلك الطلبية لأي مدينة.',
      codPayment: 'الدفع عند الاستلام (COD)',
      cmiPayment: 'بطاقة مغربية (CMI)',
      havePromo: 'هل لديك كود تخفيض؟ (جرب: AR10)',
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
      orderSuccessCod: 'تم تسجيل طلبك بنجاح!',
      orderSuccessGateway: 'سيتم توجيهك لبوابة الدفع الآمنة لإتمام الأداء...',
      cardPreview: 'معاينة البطاقة',
      cardholderName: 'الاسم على البطاقة',
      cardholderPlaceholder: 'الاسم كما هو مكتوب على البطاقة',
      cardNumber: 'رقم البطاقة',
      expiryDate: 'تاريخ الانتهاء',
      cvv: 'CVV / CVC',
      cvvHint: 'ثلاثة أرقام خلف البطاقة',
      demoNotice: 'هذه معاينة للتصميم فقط: لا يتم إرسال بيانات البطاقة ولا يتم خصم أي مبلغ.',
      processingPayment: 'جارٍ إتمام الأداء...',
      demoSuccess: 'نجح الأداء التجريبي',
      demoSuccessNotice: 'لم يتم تنفيذ أداء حقيقي أو خصم أي مبلغ. اربط بوابة دفع آمنة قبل الإطلاق.',
      demoReference: 'مرجع التجربة',
      paymentDone: 'إنهاء',
      invalidCard: 'المرجو إدخال معلومات بطاقة صحيحة.',
      encrypted: 'اتصال آمن',
    },
    en: {
      topBanner: 'Delivery to all cities in Morocco (Casablanca, Rabat, Marrakech, Beni Mellal and all cities)',
      shippingNotice: 'Cash on Delivery (COD) or secure CMI card payment',
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
      customerReviews: 'Customer Reviews',
      reviewsTitle: 'Trusted by customers across all cities.',
      reviewsDesc: 'Discover experiences of our valued clients with our services.',
      addToCart: 'Add to Bag',
      continueShopping: 'Continue Shopping',
      close: 'Close',
      ourCommitment: 'Our Commitment',
      commitmentTitle: 'Fast delivery to all Moroccan cities. Total security & trust.',
      codTitle: 'Cash on Delivery (COD)',
      codDesc: 'Pay for your order in cash safely right at your doorstep.',
      onlinePayTitle: 'Online Gateway (CMI)',
      onlinePayDesc: 'Choose secure online payment through the CMI card gateway.',
      nationalCoverTitle: 'Nationwide Shipping',
      nationalCoverDesc: 'We cover all cities and towns across the Kingdom of Morocco swiftly.',
      footerDesc: 'Your favorite store for accessories, jewellery and smart tech with delivery across all Moroccan cities.',
      quickLinks: 'Quick Links',
      categoriesFooter: 'Categories',
      trustAndLegal: 'Trust & Legal',
      termsOfService: 'Terms of Service',
      returnPolicy: 'Return Policy',
      footerRights: '©️ 2026 AR Accessories Co. · All rights reserved (Delivery across Morocco).',
      cartTitle: 'Shopping Bag',
      emptyCart: 'Your bag is empty.',
      emptyCartDesc: 'Explore our wide collection and add what you like.',
      browseProducts: 'Browse Products',
      subtotal: 'Subtotal',
      discount: 'Promo Discount',
      totalAmount: 'Total Amount',
      checkoutBtn: 'Proceed to Checkout',
      checkoutTitle: 'Checkout & Payment Options',
      checkoutDesc: 'Select your preferred payment method (optional) and enter details for nationwide delivery.',
      codPayment: 'Cash on Delivery (COD)',
      cmiPayment: 'Moroccan Card (CMI)',
      havePromo: 'Have a promo code? (Try: AR10)',
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
      orderSuccessCod: 'Order request received successfully!',
      orderSuccessGateway: 'Redirecting to secure payment gateway...',
      cardPreview: 'Card preview',
      cardholderName: 'Cardholder name',
      cardholderPlaceholder: 'Name as shown on the card',
      cardNumber: 'Card number',
      expiryDate: 'Expiry date',
      cvv: 'CVV / CVC',
      cvvHint: 'Three digits on the back of your card',
      demoNotice: 'Design preview only: card details are not sent and no money is charged.',
      processingPayment: 'Processing payment...',
      demoSuccess: 'Payment Successful (Demo)',
      demoSuccessNotice: 'No real payment was processed and no money was charged. Connect a secure gateway before launch.',
      demoReference: 'Demo reference',
      paymentDone: 'Done',
      invalidCard: 'Please enter valid card details.',
      encrypted: 'Secure connection',
    }
  }

  const currentText = t[lang]

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
  
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const total = Math.max(0, subtotal - appliedDiscount)
  
  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id)
      return existing
        ? current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, quantity: 1 }]
    })
    toast.success(lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag', { description: lang === 'ar' ? product.name : product.nameEn })
  }

  const updateQuantity = (id: string, change: number) => setCart(current => current.flatMap(item => {
    if (item.product.id !== id) return [item]
    const quantity = item.quantity + change
    return quantity > 0 ? [{ ...item, quantity }] : []
  }))

  const applyPromo = () => {
    const code = customer.promoCode.trim().toUpperCase()
    if (code === 'AR10') {
      const discount = Math.round(subtotal * 0.1)
      setAppliedDiscount(discount)
      toast.success(lang === 'ar' ? 'تم تطبيق كود التخفيض!' : 'Promo code applied!', { description: lang === 'ar' ? 'تخفيض 10% على طلبيتك.' : '10% discount added to your order.' })
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(50)
      toast.success(lang === 'ar' ? 'تم تطبيق كود التخفيض!' : 'Promo code applied!', { description: lang === 'ar' ? 'تخفيض الشحن 50 درهم.' : '50 DH shipping discount added.' })
    } else {
      toast.error(lang === 'ar' ? 'كود تخفيض غير صالح' : 'Invalid promo code', { description: lang === 'ar' ? 'جرب استخدام كود "AR10"' : 'Try using code "AR10"' })
    }
  }

  const supportWhatsappUrl = `https://wa.me/212610967239?text=${encodeURIComponent('Hello AR Accessories Co., I need assistance with my order...')}`

  const placeOrder = async () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim() || !customer.address.trim()) {
      toast.error(lang === 'ar' ? 'المرجو إتمام جميع معلومات التوصيل (بما فيها المدینة).' : 'Please complete all delivery details (including city).')
      return
    }

    const orderItems = cart.map(item =>
      `- ${lang === 'ar' ? item.product.name : item.product.nameEn} x ${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`,
    ).join('\n')
    const waMessage = `${lang === 'ar' ? 'السلام عليكم، أريد تأكيد طلبي:' : 'Hello, I would like to confirm my order:'}

${lang === 'ar' ? 'الاسم الكامل' : 'Full name'}: ${customer.name.trim()}
${lang === 'ar' ? 'رقم الهاتف' : 'Phone'}: ${customer.phone.trim()}
${lang === 'ar' ? 'المدينة' : 'City'}: ${customer.city.trim()}
${lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed address'}: ${customer.address.trim()}

${lang === 'ar' ? 'المنتجات' : 'Products'}:
${orderItems}

${lang === 'ar' ? 'المبلغ الإجمالي' : 'Total'}: ${formatPrice(total)}`
    const whatsappUrl = `https://wa.me/212610967239?text=${encodeURIComponent(waMessage)}`
    const whatsappWindow = window.open(whatsappUrl, '_blank')
    if (!whatsappWindow) window.location.href = whatsappUrl

    setBusy(true)
    try {
      const orderTable = blink.db.table<OrdersRow>('orders')
      await orderTable.create({
        userId: 'guest', 
        customerName: customer.name.trim(), 
        phone: customer.phone.trim(), 
        address: `${customer.city.trim()} - ${customer.address.trim()}`,
        itemsJson: JSON.stringify(cart.map(item => ({ id: item.product.id, name: item.product.name, quantity: item.quantity, price: item.product.price }))),
        totalAmount: total, 
        status: 'pending',
      })
    } catch (error) {
      console.error('Failed to save guest order; WhatsApp order was opened.', error)
    } finally {
      toast.success(currentText.orderSuccessCod, { description: lang === 'ar' ? 'نحن نشحن بكل أمان لجميع مدن المغرب.' : 'We ship securely to all cities across Morocco.' })
      setCart([])
      setCartOpen(false)
      setCheckoutOpen(false)
      setCustomer({ name: '', phone: '', city: '', address: '', promoCode: '' })
      setAppliedDiscount(0)
      setCard({ cardholder: '', number: '', expiry: '', cvv: '' })
      setGatewayStep('details')
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
        className={`fixed bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95 ${lang === 'ar' ? 'left-6' : 'right-6'}`}
      >
        <MessageCircle size={28}/>
      </a>

      <div className="relative bg-linear-to-r from-zinc-900 via-primary to-zinc-900 px-4 py-2.5 text-center text-xs font-medium text-white shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-300"/> Maroc Delivery
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
          <a href="#home" className="flex shrink-0 items-center gap-3 transition-transform duration-200 active:scale-95" aria-label="AR Accessories Co. home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-serif text-lg font-bold text-primary-foreground shadow-sm">AR</span>
            <span className="leading-tight"><b className="block text-[13px] tracking-[0.11em]">AR ACCESSORIES CO.</b><small className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Maroc Store</small></span>
          </a>
          <nav className={`hidden items-center gap-7 text-xs font-medium text-muted-foreground lg:flex ${lang === 'ar' ? 'mr-5' : 'ml-5'}`}>
            <a className="transition hover:text-foreground active:scale-95" href="#collection">{currentText.shopAll}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Jewellery')}>{currentText.jewellery}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Sneakers')}>{currentText.sneakers}</a>
            <a className="transition hover:text-foreground active:scale-95" href="#collection" onClick={() => setCategory('Audio')}>{currentText.audio}</a>
          </nav>
          <label className={`mx-auto hidden h-10 max-w-sm flex-1 items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-4 md:flex transition-all focus-within:border-primary`}>
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

      <section id="home" className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:py-14">
        <div className="order-2 py-3 lg:order-1 lg:py-10">
          <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary"><span className="h-px w-7 bg-primary"/>{currentText.welcome}</p>
          <h1 className="max-w-xl font-serif text-[clamp(2.8rem,6vw,5.4rem)] leading-[0.98] tracking-tighter">{currentText.heroTitle1}<br/><span className="italic text-primary">{currentText.heroTitle2}</span></h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">{currentText.heroDesc}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#collection" className="inline-flex h-12 items-center gap-3 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95">{currentText.shopNow} <ArrowRight size={15}/></a>
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
                  {lang === 'ar' ? categoryLabels[item]?.ar ?? item : categoryLabels[item]?.en ?? item}
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
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{product.category}</p>
                  <h3 onClick={() => setSelectedProduct(product)} className="min-h-10 text-sm font-semibold leading-5 cursor-pointer hover:text-primary transition-colors">{lang === 'ar' ? product.name : product.nameEn}</h3>
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                    <button onClick={() => addToCart(product)} aria-label={`Add product to cart`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-110 active:scale-90 shadow-sm"><Plus size={17}/></button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{lang === 'ar' ? product.description : product.descriptionEn}</p>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-border py-14 text-center"><p className="font-serif text-2xl">{lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching results.'}</p><p className="mt-2 text-sm text-muted-foreground">{lang === 'ar' ? 'جرب البحث بكلمة أخرى أو تصفح قسم مختلف.' : 'Try searching with another keyword or category.'}</p></div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{currentText.customerReviews}</p>
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">{currentText.reviewsTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{currentText.reviewsDesc}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {reviews.map(review => (
            <div key={review.id} className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-500"/>
                  ))}
                </div>
                <Quote size={24} className="text-primary/20 mb-2"/>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic mb-6">"{lang === 'ar' ? review.comment : review.commentEn}"</p>
              </div>
              <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold">{lang === 'ar' ? review.name : review.nameEn}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{lang === 'ar' ? review.city : review.cityEn}</span>
              </div>
            </div>
          ))}
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">{selectedProduct.category}</p>
                <h3 className="font-serif text-2xl sm:text-3xl leading-tight mb-3">{lang === 'ar' ? selectedProduct.name : selectedProduct.nameEn}</h3>
                <p className="text-xl font-bold mb-4 text-primary">{formatPrice(selectedProduct.price)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">{lang === 'ar' ? selectedProduct.description : selectedProduct.descriptionEn}</p>
              </div>
              <div className="space-y-2.5">
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95">
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
            {modalPage === 'terms' ? (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-primary"><FileText size={20}/> {currentText.termsOfService}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{lang === 'ar' ? 'مرحباً بك في AR Accessories Co. باستخدامك لهذا الموقع وقيامك بالطلب، فإنك توافق على الالتزام بالشروط والأحكام الخاصة بالبيع والتوصيل داخل المغرب.' : 'Welcome to AR Accessories Co. By using this site and ordering, you agree to our terms of service and nationwide Moroccan delivery conditions.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-primary"><RotateCcw size={20}/> {currentText.returnPolicy}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{lang === 'ar' ? 'نحن نضمن جودة منتجاتنا. في حال وجود عيب مصنعي أو خطأ في الطلب، نتيح لك الاستبدال أو الاسترجاع خلال 7 أيام من تاريخ الاستلام.' : 'We guarantee product quality. In case of manufacturing defect or wrong order, we allow exchange or return within 7 days of delivery.'}</p>
              </div>
            )}
            <button onClick={() => setModalPage('none')} className="mt-6 w-full rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground">{currentText.close}</button>
          </div>
        </div>
      )}

      <section id="promise" className="mx-auto grid max-w-7xl gap-7 px-4 py-12 sm:px-8 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center border-t border-border/80">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{currentText.ourCommitment}</p>
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{currentText.commitmentTitle}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[{ icon: Banknote, title: currentText.codTitle, body: currentText.codDesc }, { icon: CreditCard, title: currentText.onlinePayTitle, body: currentText.onlinePayDesc }, { icon: Truck, title: currentText.nationalCoverTitle, body: currentText.nationalCoverDesc }].map(item => (
            <div key={item.title} className="border-t border-border pt-4">
              <item.icon size={19} className="mb-3 text-primary"/>
              <h3 className="text-xs font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-8 md:grid-cols-[1fr_auto_auto_auto] md:items-start">
          <div>
            <a href="#home" className="inline-flex items-center gap-2.5 transition-transform duration-200 active:scale-95">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground font-serif font-bold text-primary">AR</span>
              <b className="text-xs tracking-[0.12em]">AR ACCESSORIES CO.</b>
            </a>
            <p className="mt-3 max-w-xs text-xs leading-5 text-primary-foreground/75">{currentText.footerDesc}</p>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">{currentText.quickLinks}</p>
            <div className="grid gap-2 text-xs">
              <a className="transition hover:underline active:scale-95" href="#collection">{currentText.shopAll}</a>
              <a className="transition hover:underline active:scale-95" href="#promise">{currentText.deliveryServices}</a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">{currentText.categoriesFooter}</p>
            <div className="grid gap-2 text-xs">
              <a className="transition hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Jewellery')}><span className="inline-flex items-center gap-2"><Watch size={13}/> {currentText.jewellery}</span></a>
              <a className="transition hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Sneakers')}><span className="inline-flex items-center gap-2"><Zap size={13}/> {currentText.sneakers}</span></a>
              <a className="transition hover:underline active:scale-95" href="#collection" onClick={() => setCategory('Audio')}><span className="inline-flex items-center gap-2"><Headphones size={13}/> {currentText.audio}</span></a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">{currentText.trustAndLegal}</p>
            <div className="grid gap-2 text-xs">
              <button onClick={() => setModalPage('terms')} className="text-left transition hover:underline active:scale-95">{currentText.termsOfService}</button>
              <button onClick={() => setModalPage('returns')} className="text-left transition hover:underline active:scale-95">{currentText.returnPolicy}</button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 py-4 text-center text-[9px] text-primary-foreground/65">{currentText.footerRights}</div>
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
                <button onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground active:scale-95 transition-transform duration-200">{currentText.browseProducts}</button>
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
                  <button onClick={() => { setCartOpen(false); setCheckoutOpen(true) }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-95">{currentText.checkoutBtn} <ArrowRight size={15}/></button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4 backdrop-blur-sm" onClick={() => setCheckoutOpen(false)}>
          <section role="dialog" aria-modal="true" onClick={event => event.stopPropagation()} className="checkout-scrollbar-hidden max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-background p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">Secure Checkout & Gateways</p>
                <h2 className="mt-1 font-serif text-3xl">{currentText.checkoutTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{currentText.checkoutDesc}</p>
              </div>
              <button aria-label="Close checkout" onClick={() => { setCheckoutOpen(false); setGatewayStep('details') }} className="rounded-full p-2 hover:bg-muted active:scale-90 transition-transform"><X size={17}/></button>
            </div>

            <style>{`
              .checkout-scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
              .checkout-scrollbar-hidden::-webkit-scrollbar { display: none; }
              @keyframes payment-stage-in { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
              @keyframes payment-check-pop { 0% { opacity: 0; transform: scale(.45) rotate(-18deg); } 70% { opacity: 1; transform: scale(1.12) rotate(4deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
              .payment-stage-enter { animation: payment-stage-in 320ms cubic-bezier(.23,1,.32,1) both; }
              .payment-check-pop { animation: payment-check-pop 520ms cubic-bezier(.23,1,.32,1) both; }
              @media (prefers-reduced-motion: reduce) { .payment-stage-enter, .payment-check-pop { animation-duration: 1ms; } }
            `}</style>

            {gatewayStep === 'processing' ? (
              <div className="payment-stage-enter flex min-h-105 flex-col items-center justify-center rounded-2xl border border-border bg-secondary/30 p-6 text-center sm:p-8" aria-live="polite">
                <div className="w-full max-w-sm rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-left text-white shadow-2xl transition-transform duration-500">
                  <div className="flex items-start justify-between"><span className="grid h-8 w-10 place-items-center rounded-md bg-linear-to-br from-amber-200 to-yellow-500 text-[8px] font-bold text-yellow-950">CARD</span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{card.number.startsWith('4') ? 'VISA' : card.number.startsWith('5') ? 'MASTERCARD' : paymentMethod.toUpperCase()}</span></div>
                  <p className="mt-7 break-all font-mono text-base tracking-[0.14em] sm:text-lg">{card.number ? card.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</p>
                  <div className="mt-5 flex justify-between gap-3 text-[9px] uppercase tracking-wider text-white/75"><span className="min-w-0 truncate">{card.cardholder || currentText.cardholderName}</span><span>{card.expiry || 'MM/YY'}</span></div>
                </div>
                <div className="mt-7 flex items-center gap-3"><span className="h-6 w-6 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"/><h3 className="font-serif text-2xl">{currentText.processingPayment}</h3></div>
                <p className="mt-2 max-w-sm text-xs text-muted-foreground">{currentText.demoNotice}</p>
              </div>
            ) : gatewayStep === 'success' ? (
              <div className="payment-stage-enter flex min-h-105 flex-col items-center justify-center rounded-2xl border border-border bg-secondary/30 p-6 text-center" aria-live="polite">
                <h3 className="font-serif text-3xl">{currentText.demoSuccess}</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">{currentText.demoSuccessNotice}</p>
                <div className="relative mt-6 w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-left text-white shadow-2xl sm:p-6">
                  <div className="flex items-start justify-between"><span className="grid h-8 w-10 place-items-center rounded-md bg-linear-to-br from-amber-200 to-yellow-500 text-[8px] font-bold text-yellow-950">CARD</span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{paymentMethod.toUpperCase()}</span></div>
                  <p className="mt-7 break-all font-mono text-base tracking-[0.14em] sm:text-lg">•••• •••• •••• {card.number.replace(/\D/g, '').slice(-4) || '••••'}</p>
                  <div className="mt-5 flex justify-between gap-4 text-[9px] uppercase tracking-wider text-white/75"><span className="truncate">{card.cardholder || 'CARDHOLDER'}</span><span>{card.expiry || 'MM/YY'}</span></div>
                  <div className="absolute inset-0 grid place-items-center bg-slate-950/35"><div className="payment-check-pop grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-2xl sm:h-24 sm:w-24"><Check size={52} strokeWidth={3.5}/></div></div>
                </div>
                <div className="mt-4 flex w-full max-w-sm justify-between rounded-xl border border-border bg-background px-4 py-3 text-xs"><span>{currentText.demoReference}</span><b>{orderReference}</b></div>
                <div className="mt-3 flex w-full max-w-sm justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold"><span>{currentText.totalAmount}</span><span>{formatPrice(total)}</span></div>
                <button onClick={() => { setCart([]); setCartOpen(false); setCheckoutOpen(false); setCustomer({ name: '', phone: '', city: '', address: '', promoCode: '' }); setCard({ cardholder: '', number: '', expiry: '', cvv: '' }); setAppliedDiscount(0); setGatewayStep('details') }} className="mt-6 h-12 w-full max-w-sm rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95">{currentText.paymentDone}</button>
              </div>
            ) : (
            <>
            <div className="payment-stage-enter space-y-4">
              {/* Available payment methods: Cash on Delivery or CMI */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setPaymentMethod('cod'); setGatewayStep('details') }} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${paymentMethod === 'cod' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border'}`}>
                  <Banknote size={17}/> <span>COD</span>
                </button>
                <button type="button" onClick={() => { setPaymentMethod('cmi'); setGatewayStep('details') }} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${paymentMethod === 'cmi' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border'}`}>
                  <CreditCard size={17}/> <span>CMI Maroc</span>
                </button>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2">
                <span className="text-xs font-semibold flex items-center gap-1.5"><Tag size={13} className="text-primary"/> {currentText.havePromo}</span>
                <div className="flex gap-2">
                  <input value={customer.promoCode} onChange={event => setCustomer(current => ({ ...current, promoCode: event.target.value }))} placeholder={currentText.promoPlaceholder} className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-xs uppercase outline-none focus:border-primary"/>
                  <button type="button" onClick={applyPromo} className="h-10 px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95">{currentText.applyBtn}</button>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.fullName}</span>
                  <input value={customer.name} onChange={event => setCustomer(current => ({ ...current, name: event.target.value }))} placeholder={currentText.fullNamePlaceholder} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{currentText.phone}</span>
                  <input value={customer.phone} onChange={event => setCustomer(current => ({ ...current, phone: event.target.value }))} placeholder="+212 6XX XXX XXX" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"/>
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

              {paymentMethod !== 'cod' && (
                <div className="grid gap-5 rounded-2xl border border-border bg-secondary/20 p-4 sm:grid-cols-[0.9fr_1.1fr] sm:p-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold">{currentText.cardPreview}</p>
                    <div className="perspective-[1000px]">
                      <div className="relative h-48 w-full transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: cardIsFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-white shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                          <div className="flex items-start justify-between"><span className="grid h-8 w-10 place-items-center rounded-md bg-linear-to-br from-amber-200 to-yellow-500 text-[8px] font-bold text-yellow-950">CARD</span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{card.number.startsWith('4') ? 'VISA' : card.number.startsWith('5') ? 'MASTERCARD' : 'CARD'}</span></div>
                          <p className="mt-7 break-all font-mono text-base tracking-[0.14em] sm:text-lg">{card.number ? card.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</p>
                          <div className="mt-5 flex justify-between gap-3 text-[9px] uppercase tracking-wider text-white/75"><span className="min-w-0 truncate">{card.cardholder || currentText.cardholderName}</span><span className="shrink-0">{card.expiry || 'MM/YY'}</span></div>
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-white shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                          <div className="-mx-5 mt-4 h-10 bg-black/75"/>
                          <div className="mt-5 flex h-9 items-center justify-end rounded bg-white px-3 font-mono tracking-[0.25em] text-slate-900">•••</div>
                          <p className="mt-3 text-right text-[9px] uppercase tracking-wider text-white/75">{currentText.cvvHint}</p>
                        </div>
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-[10px] text-emerald-700"><ShieldCheck size={13}/>{currentText.encrypted}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="block"><span className="mb-1 block text-[11px] font-semibold">{currentText.cardholderName}</span><input autoComplete="cc-name" value={card.cardholder} onChange={event => setCard(current => ({ ...current, cardholder: event.target.value.toUpperCase() }))} placeholder={currentText.cardholderPlaceholder} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/></label>
                    <label className="block"><span className="mb-1 block text-[11px] font-semibold">{currentText.cardNumber}</span><input inputMode="numeric" autoComplete="cc-number" maxLength={23} value={card.number.replace(/(.{4})/g, '$1 ').trim()} onChange={event => setCard(current => ({ ...current, number: event.target.value.replace(/\D/g, '').slice(0, 19) }))} placeholder="1234 5678 9012 3456" className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-xs tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block"><span className="mb-1 block text-[11px] font-semibold">{currentText.expiryDate}</span><input inputMode="numeric" autoComplete="cc-exp" maxLength={5} value={card.expiry} onChange={event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); setCard(current => ({ ...current, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits })) }} placeholder="MM/YY" className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/></label>
                      <label className="block"><span className="mb-1 block text-[11px] font-semibold">{currentText.cvv}</span><input inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onFocus={() => { setCardIsFlipped(true); triggerPaymentFeedback('flip') }} onBlur={() => setCardIsFlipped(false)} onChange={event => setCard(current => ({ ...current, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="•••" className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-xs tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/></label>
                    </div>
                    <p className="rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-[10px] leading-4 text-amber-900">{currentText.demoNotice}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="my-5 rounded-xl bg-secondary p-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground"><span>{currentText.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
              {appliedDiscount > 0 && <div className="flex justify-between text-xs text-emerald-600 font-medium"><span>{currentText.discount}</span><span>-{formatPrice(appliedDiscount)}</span></div>}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/60"><span>{currentText.totalAmount}</span><span>{formatPrice(total)}</span></div>
            </div>

            <button disabled={busy} onClick={placeOrder} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-65">
              {currentText.confirmOrder} <ArrowRight size={15}/>
            </button>
            </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}