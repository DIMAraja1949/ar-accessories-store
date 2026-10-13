import React, { useCallback, useEffect, useState } from 'react'
import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Download, Lock, LogOut, PackagePlus, Pencil, ShieldCheck, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  DEFAULT_PRODUCTS,
  deleteProduct,
  getStoredProducts,
  normalizeProductCategory,
  seedDefaultProductsIfEmpty,
  saveProduct,
  saveProducts,
  subscribeToProducts,
  type StoredProduct,
} from '@/lib/products-storage'
import {
  getCurrentProductAdmin,
  hasProductAdminAccess,
  signInProductAdmin,
  signOutProductAdmin,
  supabase,
} from '@/lib/supabase'

type ProductRow = StoredProduct

const getErrorMessage = (error: unknown) =>
  typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : error instanceof Error
      ? error.message
      : String(error)

const emptyForm = { name: '', category: 'Phone Cases', price: '', originalPrice: '', stock: '10', image: '', galleryImages: '', description: '', details: '', materials: '', sizes: '', colors: '', rating: '', reviewCount: '' }
const readImageFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => typeof reader.result === 'string'
    ? resolve(reader.result)
    : reject(new Error(`تعذر قراءة الصورة ${file.name}.`))
  reader.onerror = () => reject(reader.error ?? new Error(`تعذر قراءة الصورة ${file.name}.`))
  reader.readAsDataURL(file)
})

export const Route = createFileRoute('/admin')({
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const [authReady, setAuthReady] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [items, setItems] = useState<ProductRow[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    let mounted = true
    const checkAccess = (userId: string | undefined) => {
      if (!userId) {
        if (mounted) {
          setIsAuthed(false)
          setAuthReady(true)
        }
        return
      }
      void hasProductAdminAccess(userId)
        .then(hasAccess => {
          if (mounted) {
            setIsAuthed(hasAccess)
            setAuthReady(true)
          }
        })
        .catch(error => {
          console.error('Failed to verify product admin access', error)
          if (mounted) {
            setIsAuthed(false)
            setAuthReady(true)
          }
        })
    }

    void getCurrentProductAdmin()
      .then(hasAccess => {
        if (mounted) {
          setIsAuthed(hasAccess)
          setAuthReady(true)
        }
      })
      .catch(error => {
        console.error('Failed to restore product admin session', error)
        if (mounted) {
          setIsAuthed(false)
          setAuthReady(true)
        }
      })
    const { data: authListener } = supabase?.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => checkAccess(session?.user.id), 0)
    }) ?? { data: { subscription: null } }

    return () => {
      mounted = false
      authListener.subscription?.unsubscribe()
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setListLoading(true)
    try {
      const rows = await getStoredProducts()
      const sorted = [...rows].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      setItems(sorted)
      return sorted
    } catch (error) {
      console.error('Failed to fetch admin products from Supabase:', error)
      throw error
    } finally {
      setListLoading(false)
    }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      await fetchProducts()
    } catch (error) {
      console.error('Failed to fetch admin products from Supabase:', error)
      toast.error('ما قدرناش نجيبو المنتجات', { description: getErrorMessage(error) })
    }
  }, [fetchProducts])

  useEffect(() => {
    if (!isAuthed) return
    void (async () => {
      await seedDefaultProductsIfEmpty()
      await loadProducts()
    })().catch(error => {
      console.error('Failed to initialize admin products:', error)
      toast.error('ما قدرناش نجهزو المنتجات', { description: getErrorMessage(error) })
    })
    return subscribeToProducts(() => { void loadProducts() })
  }, [isAuthed, loadProducts])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInProductAdmin(email.trim(), password)
      setIsAuthed(true)
      setEmail('')
      setPassword('')
      toast.success('مرحبا بك فلوحة الإدارة.')
    } catch (error) {
      toast.error('تعذر تسجيل الدخول', { description: error instanceof Error ? error.message : 'تحقق من بيانات الدخول وحاول مرة أخرى.' })
    }
  }

  const handleLogout = async () => {
    try {
      await signOutProductAdmin()
      setIsAuthed(false)
    } catch (error) {
      toast.error('تعذر تسجيل الخروج', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('المرجو اختيار صورة فقط.')
      event.target.value = ''
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('حجم الصورة كبير؛ اختار صورة أقل من 3 MB.')
      event.target.value = ''
      return
    }
    setUploadingImage(true)
    try {
      const image = await readImageFile(file)
      setForm(current => ({ ...current, image }))
      toast.success('وجدات الصورة للحفظ محلياً.')
    } catch (error) {
      toast.error('ما قدرناش نرفعو الصورة', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleGalleryImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (files.length === 0) return

    const invalidFile = files.find(file => !file.type.startsWith('image/'))
    if (invalidFile) {
      toast.error(`الملف "${invalidFile.name}" ماشي صورة.`)
      return
    }
    const oversizedFile = files.find(file => file.size > 3 * 1024 * 1024)
    if (oversizedFile) {
      toast.error(`الصورة "${oversizedFile.name}" كبيرة؛ اختار صور أقل من 3 MB لكل صورة.`)
      return
    }

    setUploadingGalleryImages(true)
    try {
      const images = await Promise.all(files.map(readImageFile))
      setGalleryImagePreviews(current => [...new Set([...current, ...images])])
      toast.success(`وجدات ${images.length} صور للمعرض.`)
    } catch (error) {
      toast.error('ما قدرناش نقراو صور المعرض', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    } finally {
      setUploadingGalleryImages(false)
    }
  }

  const startEdit = (row: ProductRow) => {
    setEditingId(row.id)
    setGalleryImagePreviews(row.galleryImages ?? [])
    setForm({
      name: row.name ?? '',
      category: row.category ?? 'Phone Cases',
      price: String(row.price ?? ''),
      originalPrice: row.originalPrice != null ? String(row.originalPrice) : '',
      stock: String(row.stock ?? 10),
      image: row.image ?? '',
      galleryImages: '',
      description: row.description ?? '',
      details: row.details ?? '',
      materials: row.materials ?? '',
      sizes: row.sizes?.join(', ') ?? '',
      colors: row.colors?.join(', ') ?? '',
      rating: row.rating != null ? String(row.rating) : '',
      reviewCount: row.reviewCount != null ? String(row.reviewCount) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setGalleryImagePreviews([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthed) {
      toast.error('خاصك تدخل كلمة المرور أولاً.')
      return
    }
    if (!form.image) {
      toast.error('اختار صورة للمنتج قبل الحفظ.')
      return
    }
    const sizes = form.sizes.split(',').map(size => size.trim()).filter(Boolean)
    const colors = form.colors.split(',').map(color => color.trim()).filter(Boolean)
    if (form.category === 'Clothing' && (sizes.length === 0 || colors.length === 0)) {
      toast.error('دخل المقاسات والألوان المتوفرة للملابس.')
      return
    }
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined
    const rating = form.rating ? Number(form.rating) : undefined
    const reviewCount = form.reviewCount ? Number(form.reviewCount) : undefined
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice <= Number(form.price))) {
      toast.error('الثمن قبل التخفيض خاصو يكون أكبر من الثمن الحالي.')
      return
    }
    if (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      toast.error('التقييم خاصو يكون بين 0 و5.')
      return
    }
    if (reviewCount !== undefined && (!Number.isInteger(reviewCount) || reviewCount < 0)) {
      toast.error('عدد التقييمات خاصو يكون عدداً صحيحاً موجباً.')
      return
    }
    setLoading(true)
    const galleryUrls = form.galleryImages.split(/\r?\n/).map(image => image.trim()).filter(Boolean)
    const galleryImages = [...new Set([...galleryImagePreviews, ...galleryUrls])]
    const data = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      originalPrice,
      stock: Number.parseInt(form.stock || '10', 10),
      image: form.image,
      galleryImages,
      description: form.description.trim(),
      details: form.details.trim(),
      materials: form.materials.trim(),
      rating,
      reviewCount,
      sizes: form.category === 'Clothing' ? sizes : undefined,
      colors: form.category === 'Clothing' ? colors : undefined,
    }
    try {
      const rows = await getStoredProducts()
      if (editingId) {
        const existing = rows.find(row => row.id === editingId)
        if (!existing) throw new Error('المنتج المراد تعديله غير موجود.')
        await saveProduct({ ...existing, ...data })
      } else {
        await saveProduct({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data })
      }
      await fetchProducts()
      cancelEdit()
      toast.success(
        editingId ? 'تم تعديل المنتج بنجاح!' : 'تم نشر المنتج بنجاح!',
        editingId ? undefined : { description: 'غادي يبان فالمتجر مباشرة.' },
      )
    } catch (error) {
      console.error('Failed to save product in Supabase:', error)
      toast.error('تعذر حفظ المنتج أو تأكيد ظهوره من قاعدة البيانات', { description: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (row: ProductRow) => {
    if (!window.confirm(`واش متأكد بغيتي تمسح "${row.name}"؟ ما يمكنش ترجع.`)) return
    try {
      await deleteProduct(row.id)
      if (editingId === row.id) cancelEdit()
      await fetchProducts()
      toast.success('تمسح المنتج.')
    } catch (error) {
      console.error('Failed to delete product in Supabase:', error)
      toast.error('ما قدرناش نمسحو المنتج', { description: getErrorMessage(error) })
    }
  }

  const importDemoProducts = async () => {
    if (!window.confirm(`غادي نضيفو ${DEFAULT_PRODUCTS.length} منتجات تجريبية لقاعدة البيانات ونحدّثو الموجود منها. نكملو؟`)) return
    setSeeding(true)
    try {
      const demoProducts = DEFAULT_PRODUCTS.map(product => ({
        ...product,
        category: normalizeProductCategory(product.category ?? 'Accessories'),
        createdAt: product.createdAt ?? new Date().toISOString(),
      }))
      await saveProducts(demoProducts)
      await fetchProducts()
      toast.success(`تستوردو ${demoProducts.length} منتجات تجريبية.`)
    } catch (error) {
      console.error('Failed to import demo products into Supabase:', error)
      toast.error('وقع مشكل فالاستيراد', { description: getErrorMessage(error) })
    } finally {
      setSeeding(false)
    }
  }

  if (!authReady) {
    return <ClientOnly fallback={<div className="min-h-dvh animate-pulse bg-background" />}><div className="min-h-dvh bg-secondary/30" /></ClientOnly>
  }

  if (!isAuthed) {
    return (
      <ClientOnly fallback={<div className="min-h-dvh animate-pulse bg-background" />}>
        <main dir="rtl" className="grid min-h-dvh place-items-center bg-secondary/30 px-4 py-10 text-foreground">
          <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl border border-border/80 bg-background p-7 shadow-xl sm:p-9">
            <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Lock size={24}/></span>
            <h1 className="text-center text-xl font-bold">دخول الإدارة</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">سجل الدخول بحساب الإدارة ديالك باش تسيّر المنتجات.</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold text-muted-foreground">البريد الإلكتروني</span>
              <input
                type="email"
                dir="ltr"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold text-muted-foreground">كلمة المرور</span>
              <input
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <button type="submit" disabled={!email || !password} className="mt-5 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-60">
              دخول
            </button>
            <a href="/" className="mt-4 block text-center text-xs font-semibold text-muted-foreground transition hover:text-foreground">العودة للمتجر</a>
          </form>
        </main>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly fallback={<div className="min-h-dvh animate-pulse bg-background" />}>
      <main dir="rtl" className="min-h-dvh bg-secondary/30 text-foreground py-12 px-4 sm:px-8 font-sans">
        <div className="max-w-2xl mx-auto space-y-8">

          <div className="bg-background rounded-3xl shadow-xl border border-border/80 p-8 sm:p-10">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <PackagePlus size={24} />
                </span>
                <div>
                  <h1 className="text-xl font-bold">{editingId ? 'تعديل المنتج' : 'لوحة التحكم — إضافة المنتجات'}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{editingId ? 'بدّل المعلومات وضغط "حفظ التعديلات".' : 'أضف سلعك الجديدة لتظهر مباشرة لزبناء المتجر.'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="/" className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:border-primary active:scale-95">
                  العودة للمتجر <ArrowRight size={14} className="rotate-180" />
                </a>
                <button type="button" onClick={handleLogout} aria-label="تسجيل الخروج" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary active:scale-95">
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">عنوان المنتج (Nom du produit)</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: Apple AirPods Pro / Minimalist Case..." required className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">القسم</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                  <option value="Phone Cases">Phone Cases</option><option value="Smartwatches">Smartwatches</option><option value="Audio">Audio</option><option value="Jewellery">Jewellery</option><option value="Sneakers">Sneakers</option><option value="Chargers">Chargers</option><option value="Clothing">Clothing / الملابس</option>
                </select>
              </div>

              {form.category === 'Clothing' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">المقاسات (افصل بينها بفاصلة)</span>
                    <input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">الألوان (افصل بينها بفاصلة)</span>
                    <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black, Cream, Olive" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">الثمن بالدرهم (Prix en DH)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="499" required className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">الكمية في المخزون (Stock)</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="10" required className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">الثمن قبل التخفيض (اختياري)</span>
                  <input type="number" min="0" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="مثال: 599" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">التقييم / 5</span>
                    <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="4.8" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">عدد التقييمات</span>
                    <input type="number" min="0" step="1" value={form.reviewCount} onChange={e => setForm({ ...form, reviewCount: e.target.value })} placeholder="24" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">صورة المنتج</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="w-full rounded-xl border border-input bg-background p-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground" />
                <p className="mt-2 text-[11px] text-muted-foreground">اختار صورة من جهازك (حتى 3 MB). كتتحفظ محلياً فهاد المتصفح.</p>
                {uploadingImage && <p className="mt-2 text-xs text-primary">جاري رفع الصورة...</p>}
                {form.image && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border p-2"><img src={form.image} alt="معاينة صورة المنتج" className="h-16 w-16 rounded-lg object-cover"/><span className="text-xs text-muted-foreground">الصورة جاهزة</span></div>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">رابط الصورة (اختياري)</label>
                <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">رفع صور إضافية للمعرض</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesUpload}
                  disabled={uploadingGalleryImages}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">اختار عدة صور من جهازك (حتى 3 MB لكل صورة). كتتحفظ محلياً فهاد المتصفح.</p>
                {uploadingGalleryImages && <p className="mt-2 text-xs text-primary">جاري تجهيز صور المعرض...</p>}
                {galleryImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {galleryImagePreviews.map((image, index) => (
                      <div key={`${index}-${image.slice(0, 48)}`} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                        <img src={image} alt={`معاينة صورة المعرض ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImagePreviews(current => current.filter((_, imageIndex) => imageIndex !== index))}
                          aria-label={`حذف صورة المعرض ${index + 1}`}
                          title="حذف الصورة"
                          className="absolute left-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-destructive hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-bold text-muted-foreground">أو أضف روابط الصور (اختياري، رابط بكل سطر)</span>
                  <textarea rows={3} value={form.galleryImages} onChange={e => setForm({ ...form, galleryImages: e.target.value })} placeholder={'https://example.com/product-side.jpg\nhttps://example.com/product-detail.jpg'} className="w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
                </label>
                <p className="mt-1 text-[11px] text-muted-foreground">تظهر الصور كصور مصغرة بجانب الصورة الرئيسية.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">الوصف المختصر</span>
                  <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف مختصر للمنتج..." className="w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">التفاصيل والمواد</span>
                  <textarea rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="تفاصيل إضافية عن المنتج..." className="w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">المواد</span>
                  <input value={form.materials} onChange={e => setForm({ ...form, materials: e.target.value })} placeholder="مثال: جلد طبيعي، ستانلس ستيل..." className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || uploadingImage || uploadingGalleryImages} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-65 shadow-md cursor-pointer">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'حفظ التعديلات' : '🚀 نشر المنتج في المتجر'}</span>
                  )}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="flex h-12 items-center gap-1.5 rounded-full border border-border px-5 text-xs font-semibold transition hover:border-primary active:scale-95">
                    <X size={14} /> إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-background rounded-3xl shadow-xl border border-border/80 p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">المنتجات الحالية ({items.length})</h2>
                <p className="text-xs text-muted-foreground mt-0.5">من هنا تقدر تعدّل ولا تمسح أي منتج.</p>
              </div>
              <button type="button" onClick={importDemoProducts} disabled={seeding} className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[11px] font-semibold transition hover:border-primary active:scale-95 disabled:opacity-60">
                <Download size={13} /> {seeding ? 'جاري الاستيراد...' : 'استيراد المنتجات التجريبية'}
              </button>
            </div>

            {listLoading && items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">جاري التحميل...</p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">ما كاين حتى منتج بعد. زيد الأول من الفورم لفوق.</p>
            ) : (
              <ul className="space-y-3">
                {items.map(row => (
                  <li key={row.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${editingId === row.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <img src={row.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover bg-secondary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{row.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{row.category} · {Number(row.price).toLocaleString('fr-MA')} DH · المخزون: {row.stock ?? '-'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button type="button" onClick={() => startEdit(row)} aria-label="تعديل" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary active:scale-90"><Pencil size={15} /></button>
                      <button type="button" onClick={() => handleDelete(row)} aria-label="مسح" className="grid h-9 w-9 place-items-center rounded-full border border-border text-red-600 transition hover:border-red-500 hover:bg-red-50 active:scale-90"><Trash2 size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck size={15} className="text-primary" />
            <span>الدخول محمي بكلمة المرور، والمنتجات كتتحفظ محلياً فهاد المتصفح.</span>
          </div>

        </div>
      </main>
    </ClientOnly>
  )
}