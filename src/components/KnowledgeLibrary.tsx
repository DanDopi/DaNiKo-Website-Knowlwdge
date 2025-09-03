'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, Plus, LogOut, Tag, Calendar, Link as LinkIcon, Video, Edit, Trash2, MoreVertical, Settings, BookOpen, Sparkles, Filter, Grid3X3, List } from 'lucide-react'
import { EntryForm } from './EntryForm'
import { CategoryManagement } from './CategoryManagement'

interface Entry {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  categories: Category[]
  links: Link[]
  videos: Video[]
}

interface Category {
  id: string
  name: string
  parent?: Category
}

interface Link {
  id: string
  title: string
  url: string
}

interface Video {
  id: string
  title: string
  youtubeId: string
}

export function KnowledgeLibrary() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<Entry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
    fetchCategories()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || 
                           entry.categories.some(cat => cat.id === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}`
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/entries?id=${entryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId))
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          <div className="text-text-secondary animate-pulse">Loading your knowledge library...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="spotlight">
      <header className="glass sticky top-0 z-40 backdrop-blur-xl border-b border-border p-6 md:p-7">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen size={28} className="text-accent" />
              <Sparkles size={14} className="absolute -top-1 -right-1 text-accent-light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Knowledge Library</h1>
              <p className="text-sm text-text-muted">Organize and access your knowledge</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface rounded-full">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-text-secondary text-sm">Welcome, {session?.user?.username}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 md:space-y-10">
        
        {/* Search and Controls */}
        <div className="card p-6 md:p-7 animate-slide-in">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted group-hover:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search your knowledge base..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full pl-12 pr-4 text-base h-12 md:h-13"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:gap-4">
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-modern pl-10 pr-8 min-w-[160px] appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-surface border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowCategoryManagement(true)}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
                title="Manage Categories"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Categories</span>
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Entry</span>
              </button>
            </div>
          </div>

          {/* Search Results Summary */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategory && ` in "${categories.find(c => c.id === selectedCategory)?.name}"`}
                </span>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                    }}
                    className="text-accent hover:text-accent-light transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Entries Grid */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid gap-7 md:gap-8 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        } animate-fade-in`}>
          {filteredEntries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`card p-6 group transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] ${
                viewMode === 'list' ? 'flex gap-6' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Entry Header */}
              <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-2 text-text-muted hover:text-accent hover:bg-surface-hover rounded-lg transition-all"
                      title="Edit entry"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>

                {/* Categories */}
                {entry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.categories.map(category => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20"
                      >
                        <Tag size={10} />
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                {entry.links.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                      <LinkIcon size={14} />
                      Links ({entry.links.length})
                    </h4>
                    <div className="space-y-2">
                      {entry.links.slice(0, 3).map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent hover:text-accent-light text-sm p-2 rounded-lg hover:bg-accent/5 transition-all"
                        >
                          <LinkIcon size={12} className="flex-shrink-0" />
                          <span className="truncate">{link.title}</span>
                        </a>
                      ))}
                      {entry.links.length > 3 && (
                        <p className="text-text-muted text-xs">
                          +{entry.links.length - 3} more links
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {entry.videos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                      <Video size={14} />
                      Videos ({entry.videos.length})
                    </h4>
                    <div className="space-y-3">
                      {entry.videos.slice(0, 1).map(video => (
                        <div key={video.id} className="space-y-2">
                          <div className="flex items-center gap-2 text-success text-sm">
                            <Video size={12} />
                            <span className="truncate">{video.title}</span>
                          </div>
                          <div className="aspect-video rounded-lg overflow-hidden bg-bg-secondary">
                            <iframe
                              src={getYouTubeEmbedUrl(video.youtubeId)}
                              title={video.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ))}
                      {entry.videos.length > 1 && (
                        <p className="text-text-muted text-xs">
                          +{entry.videos.length - 1} more videos
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Entry Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <Calendar size={12} />
                    <span>Created {formatDate(entry.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted">
                    {entry.links.length > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <LinkIcon size={10} />
                        {entry.links.length}
                      </span>
                    )}
                    {entry.videos.length > 0 && (
                      <span className="flex items-center gap-1 text-xs ml-2">
                        <Video size={10} />
                        {entry.videos.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="card p-12 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              {searchTerm || selectedCategory ? (
                <>
                  <Search size={48} className="text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No matches found</h3>
                  <p className="text-text-muted mb-6">
                    We couldn't find any entries matching your search criteria.
                    Try adjusting your search terms or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <BookOpen size={48} className="text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Start building your knowledge base</h3>
                  <p className="text-text-muted mb-6">
                    Create your first entry to start organizing and storing your knowledge.
                    Add links, videos, and organize with categories.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary px-6 py-3"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Your First Entry
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {(showAddForm || editingEntry) && (
        <EntryForm
          entry={editingEntry}
          onClose={() => {
            setShowAddForm(false)
            setEditingEntry(null)
          }}
          onSubmit={() => {
            fetchEntries()
            fetchCategories()
            setShowAddForm(false)
            setEditingEntry(null)
          }}
        />
      )}

      {showCategoryManagement && (
        <CategoryManagement
          onClose={() => setShowCategoryManagement(false)}
          onSubmit={() => {
            fetchCategories()
            setShowCategoryManagement(false)
          }}
        />
      )}
    </div>
  )
}