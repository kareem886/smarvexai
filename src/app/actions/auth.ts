'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const brandName = formData.get('brandName') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { brand_name: brandName } } })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error: brandError } = await supabase.from('brands').insert({ name: brandName, slug, owner_id: data.user.id })

    if (!brandError) {
      const { data: brand } = await supabase.from('brands').select('id').eq('owner_id', data.user.id).single()
      if (brand) {
        await supabase.from('brand_users').insert({ brand_id: brand.id, user_id: data.user.id, role: 'owner' })
      }
    }
  }

  redirect('/dashboard')
}
