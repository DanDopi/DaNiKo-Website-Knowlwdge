'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
  parent?: Category
}

interface CategoryManagementProps {
  onClose: () => void
  onSubmit: () => void
}

export function CategoryManagement({ onClose, onSubmit }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      })

      if (response.ok) {
        setNewCategoryName('')
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (categoryId: string) => {
    if (!editingName.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName })
      })

      if (response.ok) {
        setEditingCategory(null)
        setEditingName('')
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory(category.id)
    setEditingName(category.name)
  }

  const cancelEditing = () => {
    setEditingCategory(null)
    setEditingName('')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 md:p-6 z-50 animate-fade-in">
      <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-6 md:p-7 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Edit size={24} className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Manage Categories</h2>
                <p className="text-text-muted text-sm">Organize your knowledge entries with custom categories</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 md:p-7">

        <div className="space-y-8">
          {/* Create New Category Section */}
          <div className="card p-6 md:p-7 bg-surface/50">
            <div className="flex items-center gap-3 mb-4">
              <Plus size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">Create New Category</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className="input-modern flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleCreateCategory()
                  }
                }}
              />
              <button
                onClick={handleCreateCategory}
                disabled={loading || !newCategoryName.trim()}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Plus size={16} />
                )}
                Create
              </button>
            </div>
          </div>

          {/* Existing Categories Section */}
          <div className="card p-6 md:p-7 bg-surface/50">
            <div className="flex items-center gap-3 mb-6">
              <Edit size={20} className="text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Existing Categories</h3>
                <p className="text-text-muted text-sm">Manage your current category collection</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div 
                  key={category.id} 
                  className="bg-bg-secondary rounded-lg border border-border hover:border-border-light transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-3 p-4">
                      <Edit size={18} className="text-accent flex-shrink-0" />
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input-modern flex-1"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && editingName.trim()) {
                            handleEditCategory(category.id)
                          } else if (e.key === 'Escape') {
                            cancelEditing()
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category.id)}
                          disabled={loading || !editingName.trim()}
                          className="p-2 text-success hover:text-success/80 hover:bg-success/10 rounded-lg transition-all disabled:opacity-50"
                          title="Save changes"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={loading}
                          className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all disabled:opacity-50"
                          title="Cancel editing"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-text-primary font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(category)}
                          disabled={loading}
                          className="p-2 text-text-muted hover:text-accent hover:bg-surface-hover rounded-lg transition-all disabled:opacity-50"
                          title="Edit category"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={loading}
                          className="p-2 text-text-muted hover:text-error hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-text-muted mb-2">No categories created yet</div>
                  <p className="text-text-muted text-sm">
                    Create your first category using the form above to start organizing your knowledge entries.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-border p-6 md:p-7 -m-6 md:-m-7 mt-8">
          <div className="flex justify-between items-center">
            <div className="text-text-muted text-sm">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
            </div>
            <button
              onClick={() => {
                onSubmit()
                onClose()
              }}
              className="btn-primary px-8 py-3"
            >
              Done
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}