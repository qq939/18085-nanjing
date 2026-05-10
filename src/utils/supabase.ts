import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uacwkmdyekxyqtopdele.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhY3drbWR5ZWt4eXF0b3BkZWxlIiwicmlkIjoiNTc4OTkzNTk3MDM0ODU4NzkzNDgiLCJpYXQiOjE3NDg2ODQ2MDAsImV4cCI6MjA2NDI2MDYwMH0.EU5UJ8x1nNGni4T4wP1Y7Y8hPmY9R5vL6kGJ3xC_p9c'

console.log('[Supabase] URL:', supabaseUrl)
console.log('[Supabase] Key 前20字符:', supabaseKey.substring(0, 20) + '...')

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
