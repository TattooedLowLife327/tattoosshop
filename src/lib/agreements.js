import { supabase } from './supabase'

// User Agreements
export async function recordUserAgreement(agreement) {
  const { data, error } = await supabase
    .from('user_agreements')
    .insert([{
      facebook_name: agreement.facebookName,
      shipping_address: agreement.shippingAddress,
      ip_address: agreement.ipAddress,
      checkbox_status: true,
      user_agent: agreement.userAgent
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserAgreements(facebookName) {
  const { data, error } = await supabase
    .from('user_agreements')
    .select('*')
    .eq('facebook_name', facebookName)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function hasRecentAgreement(facebookName) {
  const { data, error } = await supabase
    .from('user_agreements')
    .select('id, created_at')
    .eq('facebook_name', facebookName)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return data && data.length > 0
}

// Watchlist
export async function addToWishlist(facebookName, shippingAddress, itemId) {
  const { data, error } = await supabase
    .from('watchlist')
    .insert([{
      facebook_name: facebookName,
      shipping_address: shippingAddress,
      item_id: itemId
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeFromWishlist(facebookName, itemId) {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('facebook_name', facebookName)
    .eq('item_id', itemId)
  if (error) throw error
}

export async function getWishlist(facebookName) {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*, inventory(*)')
    .eq('facebook_name', facebookName)
  if (error) throw error
  return data
}

export async function isItemWishlisted(facebookName, itemId) {
  const { data, error } = await supabase
    .from('watchlist')
    .select('id')
    .eq('facebook_name', facebookName)
    .eq('item_id', itemId)
    .limit(1)
  if (error) throw error
  return data && data.length > 0
}

// IP Address utility
export async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}
