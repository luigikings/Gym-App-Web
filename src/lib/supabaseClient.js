import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Faltan las variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env (mira .env.example).',
  )
}

// Si faltan las variables, usamos una URL de relleno válida para que el
// cliente no explote al crearse: en vez de una pantalla en blanco, la app
// muestra una pantalla de aviso (ver src/App.jsx).
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
)

export const PHOTOS_BUCKET = 'photos'

export function publicPhotoUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path)
  return data?.publicUrl ?? null
}
