import React, { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { blink } from '@/blink/client'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { ArrowRight, Download, Lock, LogOut, PackagePlus, Pencil, ShieldCheck, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

const ADMIN_PASSWORD = 'Simo2026'
const ADMIN_AUTH_KEY = 'ar-admin-auth' // نفس المفتاح المستعمل فـ index.tsx

type ProductRow = {
  id: string
  userId?: string
  name: string
  category?: string
  price: number
  stock?: number
  image: string
  description?: string
  createdAt?: string
}

const emptyForm = { name: '', category: 'Phone Cases', price: '', stock: '10', image: '', description: '' }

// المنتجات التجريبية اللي كانت مكتوبة فالكود؛ كيتستوردو مرة وحدة باش يولّيو قابلين للتعديل والحذف
const demoProducts = [
  { name: 'Everyday Mag Case', category: 'Phone Cases', price: 249, image: 'https://images.unsplash.com/photo-1601592690120-a7cefd9c477a?auto=format&fit=crop&w=900&q=85', description: 'كوري سليم وحامي مع لمسة مطفية مريحة للاستعمال اليومي.' },
  { name: 'ساعة ذكية نشطة', category: 'Smartwatches', price: 899, image: 'https://images.unsplash.com/photo-1750776100861-30c172651817?auto=format&fit=crop&w=900&q=85', description: 'ساعة يومية متعددة الاستخدامات بشاشة واضحة وتتبع للنشاط طوال اليوم.' },
  { name: 'سوار معدني مينيمالست', category: 'Jewellery', price: 349, image: 'https://images.unsplash.com/photo-1611591475871-2ee8ab22349a?auto=format&fit=crop&w=900&q=85', description: 'مصمم خصيصاً لأناقة يومية راقية من الستانلس ستيل.' },
  { name: 'خاتم فضي كلاسيكي', category: 'Jewellery', price: 299, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85', description: 'خاتم فضي مصقول بأسلوب كلاسيكي هادئ وراقي.' },
  { name: 'حذاء جلدي عصري', category: 'Sneakers', price: 1199, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85', description: 'أحذية جلدية فاخرة تجمع بين الراحة القصوى والتصميم الحضري النظيف.' },
  { name: 'سماعات استوديو برو', category: 'Audio', price: 549, image: 'https://images.unsplash.com/photo-1600375104627-c94c416deefa?auto=format&fit=crop&w=900&q=85', description: 'سماعات لاسلكية مدمجة لمكالمات واضحة وصوت غني.' },
  { name: 'سبادريل الجري الكلاسيكي', category: 'Sneakers', price: 899, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', description: 'حذاء رياضي خفيف مصمم للتمارين اليومية والمظهر العصري السهل.' },
  { name: 'شاحن مكتب مغناطيسي', category: 'Chargers', price: 329, image: 'https://images.unsplash.com/photo-1642418714495-87fcca453f70?auto=format&fit=crop&w=900&q=85', description: 'رفيق شحن أنيق يحافظ على طاقة أجهزتك ومكتبك منظماً.' },
]

export const Route = createFileRoute('/admin')({
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const [authReady, setAuthReady] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [items, setItems] = useState<ProductRow[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    try { setIsAuthed(localStorage.getItem(ADMIN_AUTH_KEY) === 'true') } catch { setIsAuthed(false) }
    setAuthReady(true)
  }, [])

  const loadProducts = useCallback(async () => {
    setListLoading(true)
    try {
      const rows = (await blink.db.table<ProductRow>('products').list({ limit: 500 })) as ProductRow[]
      const sorted = [...rows].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      setItems(sorted)
    } catch (error) {
      toast.error('ما قدرناش نجيبو المنتجات', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => { if (isAuthed) void loadProducts() }, [isAuthed, loadProducts])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      try { localStorage.setItem(ADMIN_AUTH_KEY, 'true') } catch { /* localStorage may be unavailable */ }
      setIsAuthed(true)
      setPassword('')
      toast.success('مرحبا بك فلوحة الإدارة.')
    } else {
      toast.error('كلمة المرور غير صحيحة.')
      setPassword('')
    }
  }

  const handleLogout = () => {
    try { localStorage.removeItem(ADMIN_AUTH_KEY) } catch { /* ignore */ }
    setIsAuthed(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('المرجو اختيار صورة فقط.')
      event.target.value = ''
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('حجم الصورة كبير؛ اختار صورة أقل من 8 MB.')
      event.target.value = ''
      return
    }
    setUploadingImage(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const { publicUrl } = await blink.storage.upload(file, `products/${Date.now()}-${safeName}`)
      setForm(current => ({ ...current, image: publicUrl }))
      toast.success('ترفعَت الصورة بنجاح.')
    } catch (error) {
      toast.error('ما قدرناش نرفعو الصورة', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    } finally {
      setUploadingImage(false)
    }
  }

  const startEdit = (row: ProductRow) => {
    setEditingId(row.id)
    setForm({
      name: row.name ?? '',
      category: row.category ?? 'Phone Cases',
      price: String(row.price ?? ''),
      stock: String(row.stock ?? 10),
      image: row.image ?? '',
      description: row.description ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
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
    setLoading(true)
    const data = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number.parseInt(form.stock || '10', 10),
      image: form.image,
      description: form.description.trim(),
    }
    try {
      const table = blink.db.table('products')
      if (editingId) {
        await table.update(editingId, data)
        toast.success('تم تعديل المنتج بنجاح!')
      } else {
        await table.create({ userId: 'store-admin', ...data })
        toast.success('تم نشر المنتج بنجاح!', { description: 'غادي يبان فالمتجر من بعد التحديث.' })
      }
      cancelEdit()
      await loadProducts()
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ المنتج', { description: error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (row: ProductRow) => {
    if (!window.confirm(`واش متأكد بغيتي تمسح "${row.name}"؟ ما يمكنش ترجع.`)) return
    try {
      await blink.db.table('products').delete(row.id)
      toast.success('تمسح المنتج.')
      if (editingId === row.id) cancelEdit()
      await loadProducts()
    } catch (error) {
      toast.error('ما قدرناش نمسحو المنتج', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    }
  }

  const importDemoProducts = async () => {
    if (!window.confirm('غادي نضيفو 8 منتجات تجريبية لقاعدة البيانات باش تقدر تعدلهم وتمسحهم. نكملو؟')) return
    setSeeding(true)
    try {
      const table = blink.db.table('products')
      const existing = new Set(items.map(item => item.name))
      let added = 0
      for (const product of demoProducts) {
        if (existing.has(product.name)) continue
        await table.create({ userId: 'store-admin', stock: 10, ...product })
        added += 1
      }
      toast.success(added > 0 ? `تزادو ${added} منتجات.` : 'المنتجات التجريبية موجودة من قبل.')
      await loadProducts()
    } catch (error) {
      toast.error('وقع مشكل فالاستيراد', { description: error instanceof Error ? error.message : 'عاود المحاولة.' })
    } finally {
      setSeeding(false)
    }
  }

  if (!authReady) {
    return <BlinkClientBoundary fallback={<div className="min-h-dvh animate-pulse bg-background" />}><div className="min-h-dvh bg-secondary/30" /></BlinkClientBoundary>
  }

  if (!isAuthed) {
    return (
      <BlinkClientBoundary fallback={<div className="min-h-dvh animate-pulse bg-background" />}>
        <main dir="rtl" className="grid min-h-dvh place-items-center bg-secondary/30 px-4 py-10 text-foreground">
          <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl border border-border/80 bg-background p-7 shadow-xl sm:p-9">
            <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Lock size={24}/></span>
            <h1 className="text-center text-xl font-bold">دخول الإدارة</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">دخل كلمة المرور باش تسيّر المنتجات.</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold text-muted-foreground">كلمة المرور</span>
              <input
                type="password"
                dir="ltr"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <button type="submit" disabled={!password} className="mt-5 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-60">
              دخول
            </button>
            <a href="/" className="mt-4 block text-center text-xs font-semibold text-muted-foreground transition hover:text-foreground">العودة للمتجر</a>
          </form>
        </main>
      </BlinkClientBoundary>
    )
  }

  return (
    <BlinkClientBoundary fallback={<div className="min-h-dvh animate-pulse bg-background" />}>
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
                  <option value="Phone Cases">Phone Cases</option><option value="Smartwatches">Smartwatches</option><option value="Audio">Audio</option><option value="Jewellery">Jewellery</option><option value="Sneakers">Sneakers</option><option value="Chargers">Chargers</option>
                </select>
              </div>

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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">صورة المنتج</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="w-full rounded-xl border border-input bg-background p-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground" />
                <p className="mt-2 text-[11px] text-muted-foreground">اختار صورة من جهازك (حتى 8 MB). كتترفع وكتتحفظ تلقائياً فالمتجر.</p>
                {uploadingImage && <p className="mt-2 text-xs text-primary">جاري رفع الصورة...</p>}
                {form.image && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border p-2"><img src={form.image} alt="معاينة صورة المنتج" className="h-16 w-16 rounded-lg object-cover"/><span className="text-xs text-muted-foreground">الصورة جاهزة</span></div>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">رابط الصورة (اختياري)</label>
                <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">وصف المنتج (Description)</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="اكتب وصفاً مختصراً ومحفزاً للمنتج..." className="w-full rounded-xl border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || uploadingImage} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-65 shadow-md cursor-pointer">
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
            <span>الدخول محمي بكلمة المرور، والمنتجات كتتحفظ فقاعدة البيانات ديال المتجر.</span>
          </div>

        </div>
      </main>
    </BlinkClientBoundary>
  )
}