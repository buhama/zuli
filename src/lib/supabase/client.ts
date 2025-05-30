import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON!
  )
}