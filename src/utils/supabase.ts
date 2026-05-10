import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uacwkmdyekxyqtopdele.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhY3drbWR5ZWt4eXF0b3BkZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTgwNTMsImV4cCI6MjA5Mjk3NDA1M30.bm-LMuDArYuWmoFX8hVV-r3tYs3WgacvqsRcQtwhDe8'

console.log('[Supabase] URL:', supabaseUrl)
console.log('[Supabase] Key 前20字符:', supabaseKey.substring(0, 20) + '...')

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})