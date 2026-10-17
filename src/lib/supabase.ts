import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
const allowedProductAdminEmail = 'chefabderrahim639@gmail.com'
const SUPABASE_REQUEST_TIMEOUT_MS = 4000

const fetchWithTimeout: typeof fetch = (input, init = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS)
  const externalSignal = init.signal
  const abortFromExternalSignal = () => controller.abort()

  if (externalSignal?.aborted) {
    abortFromExternalSignal()
  } else {
    externalSignal?.addEventListener('abort', abortFromExternalSignal, { once: true })
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abortFromExternalSignal)
  })
}

export function isAllowedProductAdminEmail(email: string | undefined): boolean {
  return email?.trim().toLowerCase() === allowedProductAdminEmail
}

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before starting the app.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: { fetch: fetchWithTimeout },
      realtime: { timeout: SUPABASE_REQUEST_TIMEOUT_MS },
    })
  : null

export async function hasProductAdminAccess(userId: string, email?: string): Promise<boolean> {
  if (isAllowedProductAdminEmail(email)) return true
  if (!supabase) return false
  const { data, error } = await supabase
    .from('product_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

export async function getCurrentProductAdmin(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
    ? hasProductAdminAccess(data.session.user.id, data.session.user.email)
    : false
}

export async function signInProductAdmin(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user || !(await hasProductAdminAccess(data.user.id, data.user.email))) {
    await supabase.auth.signOut()
    throw new Error('هذا الحساب غير مخول لإدارة المنتجات.')
  }
}

export async function signOutProductAdmin(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
