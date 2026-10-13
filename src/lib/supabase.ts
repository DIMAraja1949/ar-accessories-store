import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

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
    })
  : null

export async function hasProductAdminAccess(userId: string): Promise<boolean> {
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
  return data.session ? hasProductAdminAccess(data.session.user.id) : false
}

export async function signInProductAdmin(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user || !(await hasProductAdminAccess(data.user.id))) {
    await supabase.auth.signOut()
    throw new Error('هذا الحساب غير مخول لإدارة المنتجات.')
  }
}

export async function signOutProductAdmin(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
