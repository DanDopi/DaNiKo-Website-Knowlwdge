'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Link as LinkIcon, Video, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  parent?: Category
}

interface Link {
  title: string
  url: string
}

interface Video {
  title: string
  youtubeId: string
}

interface Entry {
  id: string
  title: string
  content: string
  links: Link[]
  videos: Video[]
  categories: Category[]
}

interface EntryFormProps {
  onClose: () => void
  onSubmit: () => void
  entry?: Entry
}

export function EntryForm({ onClose, onSubmit, entry }: EntryFormProps) {
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    links: entry?.links || ([] as Link[]),
    videos: entry?.videos || ([] as Video[]),
    categoryIds: entry?.categories?.map(cat => cat.id) || ([] as string[])
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)

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

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ''
  }

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '' }]
    }))
  }

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const updateLink = (index: number, field: keyof Link, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const addVideo = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { title: '', youtubeId: '' }]
    }))
  }

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }))
  }

  const updateVideo = (index: number, field: keyof Video, value: string) => {
    if (field === 'youtubeId' && value.includes('youtube.com')) {
      value = extractYouTubeId(value)
    }
    
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) => 
        i === index ? { ...video, [field]: value } : video
      )
    }))
  }

  const createCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })

      if (response.ok) {
        const category = await response.json()
        setCategories(prev => [...prev, category])
        setNewCategory('')
        setShowNewCategory(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = entry ? `/api/entries?id=${entry.id}` : '/api/entries'
      const method = entry ? 'PUT' : 'POST'
      
      // Clean the data for submission - remove IDs from existing links and videos for editing
      const submitData = {
        ...formData,
        links: formData.links.map(link => ({ title: link.title, url: link.url })),
        videos: formData.videos.map(video => ({ title: video.title, youtubeId: video.youtubeId }))
      }
      
      console.log('Submitting data:', { url, method, data: submitData })
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        onSubmit()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Failed to ${entry ? 'update' : 'create'} entry: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error ${entry ? 'updating' : 'creating'} entry:`, error)
      alert(`Failed to ${entry ? 'update' : 'create'} entry. Please check the console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 md:p-6 z-50 animate-fade-in">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-6 md:p-7 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{entry ? 'Edit' : 'Create New'} Knowledge Entry</h2>
              <p className="text-text-muted text-sm mt-1">
                {entry ? 'Update your knowledge entry with new information' : 'Add a new piece of knowledge to your library'}
              </p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-modern w-full text-lg"
                placeholder="Enter a descriptive title for your knowledge entry..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="input-modern w-full resize-none"
                placeholder="Write your knowledge content here. Include key information, insights, and details..."
                required
              />
            </div>
          </div>

          {/* Categories Section */}
          <div className="card p-6 md:p-7 bg-surface/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-accent" />
                <label className="text-sm font-semibold text-text-primary">Categories</label>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-sm text-accent hover:text-accent-light transition-colors"
              >
                {showNewCategory ? 'Cancel' : '+ New Category'}
              </button>
            </div>

            {showNewCategory && (
              <div className="bg-bg-secondary rounded-lg p-4 mb-4 border border-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name..."
                    className="input-modern flex-1"
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    className="btn-primary px-4 py-2"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label 
                  key={category.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary hover:bg-surface-hover border border-border hover:border-border-light transition-all cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData(prev => ({
                        ...prev,
                        categoryIds: checked
                          ? [...prev.categoryIds, category.id]
                          : prev.categoryIds.filter(id => id !== category.id)
                      }))
                    }}
                    className="w-4 h-4 text-accent bg-bg-secondary border-border rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {category.name}
                  </span>
                </label>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full text-center py-4 text-text-muted">
                  No categories available. Create one above.
                </div>
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="card p-6 md:p-7 bg-surface/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={18} className="text-accent" />
                <label className="text-sm font-semibold text-text-primary">Links</label>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>

            <div className="space-y-4">
              {formData.links.map((link, index) => (
                <div key={index} className="bg-bg-secondary rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <LinkIcon size={20} className="text-accent mt-3 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Enter link title..."
                        value={link.title}
                        onChange={(e) => updateLink(index, 'title', e.target.value)}
                        className="input-modern w-full"
                      />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="input-modern w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-text-muted hover:text-error hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {formData.links.length === 0 && (
                <div className="text-center py-6 text-text-muted">
                  No links added yet. Click "Add Link" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Videos Section */}
          <div className="card p-6 md:p-7 bg-surface/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-success" />
                <label className="text-sm font-semibold text-text-primary">YouTube Videos</label>
              </div>
              <button
                type="button"
                onClick={addVideo}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Video
              </button>
            </div>

            <div className="space-y-4">
              {formData.videos.map((video, index) => (
                <div key={index} className="bg-bg-secondary rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Video size={20} className="text-success mt-3 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Enter video title..."
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        className="input-modern w-full"
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL or Video ID"
                        value={video.youtubeId}
                        onChange={(e) => updateVideo(index, 'youtubeId', e.target.value)}
                        className="input-modern w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="p-2 text-text-muted hover:text-error hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {formData.videos.length === 0 && (
                <div className="text-center py-6 text-text-muted">
                  No videos added yet. Click "Add Video" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-border p-6 md:p-7 -m-6 md:-m-7 mt-8">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {entry ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{entry ? 'Update Entry' : 'Create Entry'}</>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}