import { useId, useMemo, useState } from 'react'
import './App.css'

type UserRole = 'ADMIN' | 'CUSTOMER'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stockCount: number
  rating: number
  imageUrl: string
}

type User = {
  name: string
  email: string
  role: UserRole
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Nimbus Carry Backpack',
    category: 'Accessories',
    price: 89,
    stockCount: 24,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Monolith Desk Lamp',
    category: 'Home',
    price: 64,
    stockCount: 0,
    rating: 4.4,
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Aero Knit Sneakers',
    category: 'Footwear',
    price: 118,
    stockCount: 17,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Luma Ceramic Bottle',
    category: 'Lifestyle',
    price: 32,
    stockCount: 8,
    rating: 4.5,
    imageUrl:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Atlas Wool Coat',
    category: 'Apparel',
    price: 210,
    stockCount: 5,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Signal Wireless Speaker',
    category: 'Electronics',
    price: 142,
    stockCount: 13,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80',
  },
]

const usersByRole: Record<UserRole, User> = {
  CUSTOMER: {
    name: 'Ava Carter',
    email: 'ava@example.com',
    role: 'CUSTOMER',
  },
  ADMIN: {
    name: 'Milo Hart',
    email: 'milo@example.com',
    role: 'ADMIN',
  },
}

const emptyDraft = {
  name: '',
  category: 'Accessories',
  price: '0',
  stockCount: '0',
  imageUrl:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
}

type ProductDraft = typeof emptyDraft

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function renderStars(rating: number) {
  const filled = Math.round(rating)
  return Array.from({ length: 5 }, (_, index) =>
    index < filled ? '\u2605' : '\u2606',
  ).join('')
}

function App() {
  const [products, setProducts] = useState(initialProducts)
  const [role, setRole] = useState<UserRole>('CUSTOMER')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [cartCount, setCartCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft)
  const categorySelectId = useId()
  const searchInputId = useId()

  const currentUser = usersByRole[role]
  const categories = useMemo(
    () => ['All Categories', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        selectedCategory === 'All Categories' || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const openAddModal = () => {
    setEditingProductId(null)
    setDraft(emptyDraft)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id)
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stockCount: String(product.stockCount),
      imageUrl: product.imageUrl,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProductId(null)
  }

  const handleDraftChange = (field: keyof ProductDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextProduct = {
      id: editingProductId ?? Date.now(),
      name: draft.name.trim(),
      category: draft.category.trim(),
      price: Number(draft.price),
      stockCount: Number(draft.stockCount),
      rating: editingProductId
        ? products.find((product) => product.id === editingProductId)?.rating ?? 4.5
        : 4.5,
      imageUrl: draft.imageUrl.trim(),
    }

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId ? nextProduct : product,
        ),
      )
    } else {
      setProducts((current) => [nextProduct, ...current])
    }

    closeModal()
  }

  const handleDelete = (productId: number) => {
    setProducts((current) => current.filter((product) => product.id !== productId))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All Categories')
  }

  return (
    <div className="app-shell">
      <div className="role-banner">
        <div>
          <p className="eyebrow">Role Switcher</p>
          <strong>Testing as {currentUser.role}</strong>
          <span>
            {currentUser.name} · {currentUser.email}
          </span>
        </div>
        <div className="role-toggle" aria-label="Role switcher">
          <button
            type="button"
            className={role === 'CUSTOMER' ? 'is-active' : ''}
            onClick={() => setRole('CUSTOMER')}
          >
            Customer
          </button>
          <button
            type="button"
            className={role === 'ADMIN' ? 'is-active' : ''}
            onClick={() => setRole('ADMIN')}
          >
            Admin
          </button>
        </div>
      </div>

      <header className="top-nav">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            EC
          </div>
          <div>
            <h1>Northstar Commerce</h1>
            <p>Minimal catalog controls with role-based actions.</p>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <a href="#catalog">Catalog</a>
          <a href="#orders">Orders</a>
          <a href="#analytics">Analytics</a>
        </nav>

        <div className="toolbar-card">
          <label htmlFor={searchInputId} className="toolbar-field">
            <span>Search</span>
            <input
              id={searchInputId}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products or categories"
            />
          </label>
          <label htmlFor={categorySelectId} className="toolbar-field">
            <span>Category</span>
            <select
              id={categorySelectId}
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="catalog-layout" id="catalog">
        <section className="catalog-intro card-surface">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>Curated inventory with live RBAC visibility</h2>
            <p>
              Browse products, filter by category, and switch roles instantly to
              inspect customer and admin controls.
            </p>
          </div>
          <div className="catalog-summary">
            <div>
              <span>Visible Products</span>
              <strong>{filteredProducts.length}</strong>
            </div>
            <div>
              <span>Cart</span>
              <strong>{cartCount} items</strong>
            </div>
            {currentUser.role === 'ADMIN' ? (
              <button type="button" className="primary-button" onClick={openAddModal}>
                + Add New Product
              </button>
            ) : null}
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <section className="empty-state card-surface">
            <p className="eyebrow">No Results</p>
            <h3>No products found</h3>
            <p>Adjust the search or category filter to see matching inventory.</p>
            <button type="button" className="secondary-button" onClick={clearFilters}>
              Clear Filters
            </button>
          </section>
        ) : (
          <section className="product-grid" aria-label="Product Catalog">
            {filteredProducts.map((product) => {
              const inStock = product.stockCount > 0

              return (
                <article key={product.id} className="product-card card-surface">
                  <div className="image-wrap">
                    <img src={product.imageUrl} alt={product.name} />
                    <span className="category-badge">{product.category}</span>
                  </div>

                  <div className="product-meta">
                    <div className="product-heading-row">
                      <h3>{product.name}</h3>
                      <span className="rating" aria-label={`Rated ${product.rating} out of 5`}>
                        {renderStars(product.rating)}
                      </span>
                    </div>

                    <div className="price-row">
                      <strong>{formatPrice(product.price)}</strong>
                      <span
                        className={inStock ? 'status-badge in-stock' : 'status-badge out-of-stock'}
                      >
                        {inStock ? `In Stock · ${product.stockCount}` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!inStock}
                      onClick={() => setCartCount((count) => count + 1)}
                    >
                      Add to Cart
                    </button>

                    {currentUser.role === 'ADMIN' ? (
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <section
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Admin Control</p>
                <h3 id="product-modal-title">
                  {editingProductId ? 'Edit product' : 'Add product'}
                </h3>
              </div>
              <button type="button" className="ghost-button" onClick={closeModal}>
                Close
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => handleDraftChange('name', event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(event) => handleDraftChange('price', event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(event) => handleDraftChange('category', event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Stock</span>
                <input
                  type="number"
                  min="0"
                  value={draft.stockCount}
                  onChange={(event) => handleDraftChange('stockCount', event.target.value)}
                  required
                />
              </label>
              <label className="full-width">
                <span>Image URL</span>
                <input
                  type="url"
                  value={draft.imageUrl}
                  onChange={(event) => handleDraftChange('imageUrl', event.target.value)}
                  required
                />
              </label>

              <div className="modal-actions full-width">
                <button type="button" className="secondary-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingProductId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default App
