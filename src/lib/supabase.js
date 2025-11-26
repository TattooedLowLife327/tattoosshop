import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getInventory(filters = {}) {
  let query = supabase.from('inventory').select('*')

  // Array filters (multi-select)
  if (filters.types && filters.types.length > 0) {
    query = query.in('type', filters.types)
  }
  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('condition', filters.conditions)
  }
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in('status', filters.statuses)
  }

  // Single value filters (legacy support)
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // Range filters
  if (filters.minWeight) {
    query = query.gte('weight', filters.minWeight)
  }
  if (filters.maxWeight) {
    query = query.lte('weight', filters.maxWeight)
  }
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  // Sorting
  if (filters.sortBy) {
    query = query.order(filters.sortBy, { ascending: filters.sortAsc ?? true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getInventoryItem(id) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createInventoryItem(item) {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInventoryItem(id, updates) {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteInventoryItem(id) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function claimItems(itemIds, orderId) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ status: 'pending', claimed_by: orderId })
    .in('id', itemIds)
    .select()
  if (error) throw error
  return data
}

export async function markItemsSold(itemIds) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ status: 'sold' })
    .in('id', itemIds)
    .select()
  if (error) throw error
  return data
}

export async function releaseItems(itemIds) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ status: 'available', claimed_by: null })
    .in('id', itemIds)
    .select()
  if (error) throw error
  return data
}

export async function createOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteOrder(id) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function uploadPhoto(file, itemType) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${itemType}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from('dart-photos')
    .upload(filePath, file)

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('dart-photos')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function uploadPhotos(files, itemType) {
  const urls = []
  for (const file of files) {
    if (file) {
      const url = await uploadPhoto(file, itemType)
      urls.push(url)
    }
  }
  return urls
}
