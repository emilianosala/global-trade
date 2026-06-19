export type UserStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  status: UserStatus
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  /** null when the caller is not an approved user or admin */
  price: number | null
  image_url: string | null
  /** admin-curated flags driving the home "destacados" / "más vendidos" sections */
  is_featured: boolean
  is_bestseller: boolean
  category_id: string | null
  created_at: string
  updated_at: string
}
