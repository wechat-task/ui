import { useEffect, useState } from 'react'
import { listMySkills, deleteSkill, createSkill, updateSkill, searchSkills } from '../lib/api'
import type { Skill, CreateSkillRequest, UpdateSkillRequest } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { CreateEditSkillDialog } from '../components/CreateEditSkillDialog'

export function SkillManagement() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [searchResults, setSearchResults] = useState<Skill[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPageSize, setSearchPageSize] = useState(20)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const data = await listMySkills()
      setSkills(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSkill(null)
    setShowCreateForm(true)
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setShowCreateForm(false)
  }

  const handleSaveSkill = async (data: CreateSkillRequest | UpdateSkillRequest) => {
    try {
      if (editingSkill) {
        // Update existing skill
        setUpdating(true)
        const updatedSkill = await updateSkill(editingSkill.id, data as UpdateSkillRequest)
        setSkills(skills.map(s => s.id === editingSkill.id ? updatedSkill : s))
      } else {
        // Create new skill
        setCreating(true)
        const newSkill = await createSkill(data as CreateSkillRequest)
        setSkills([newSkill, ...skills])
      }
      setShowCreateForm(false)
      setEditingSkill(null)
    } catch (err) {
      console.error('save skill error:', err)
      alert(`Failed to ${editingSkill ? 'update' : 'create'} skill`)
    } finally {
      setCreating(false)
      setUpdating(false)
    }
  }

  const handleSearch = async (page = 1) => {
    try {
      setSearchLoading(true)
      // Build query string: combine searchQuery with category if provided
      let query = searchQuery
      if (searchCategory) {
        query = query ? `${query} category:${searchCategory}` : `category:${searchCategory}`
      }
      const response = await searchSkills({
        q: query || undefined,
        page,
        size: searchPageSize,
      })
      setSearchResults(response.data)
      setSearchTotal(response.total)
      setSearchPage(response.page || page)
      setSearchPageSize(response.size || searchPageSize)
      setShowSearchResults(true)
    } catch (err) {
      console.error('search error:', err)
      alert('Failed to search skills')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchCategory('')
    setShowSearchResults(false)
  }

  const handlePrevPage = () => {
    if (searchPage > 1) {
      handleSearch(searchPage - 1)
    }
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(searchTotal / searchPageSize)
    if (searchPage < totalPages) {
      handleSearch(searchPage + 1)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    setDeletingId(id)
    try {
      await deleteSkill(id)
      setSkills(skills.filter(skill => skill.id !== id))
    } catch (err) {
      console.error('deleteSkill error:', err)
      alert('Failed to delete skill')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-slate-100 text-slate-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public'
      case 'private': return 'Private'
      case 'unlisted': return 'Unlisted'
      default: return visibility
    }
  }

  const skillsToDisplay = showSearchResults ? searchResults : skills
  const displayTitle = showSearchResults ? 'Search Results' : 'My Skills'
  const isFormVisible = editingSkill || showCreateForm

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {isFormVisible ? (editingSkill ? 'Edit Skill' : 'Create Skill') : displayTitle}
        </h1>
        {isFormVisible ? (
          <Button variant="secondary" onClick={() => {
            setShowCreateForm(false)
            setEditingSkill(null)
          }}>Back to list</Button>
        ) : (
          <Button onClick={handleCreate}>+ Create Skill</Button>
        )}
      </div>

      {/* Search Section */}
      <Card className="mb-6 p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Public Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <input
                type="text"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                placeholder="Category"
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={() => handleSearch()} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
              {showSearchResults && (
                <Button variant="secondary" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : isFormVisible ? (
        <CreateEditSkillDialog
          skill={editingSkill}
          onConfirm={handleSaveSkill}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingSkill(null)
          }}
          loading={creating || updating}
        />
      ) : skillsToDisplay.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">
            {showSearchResults ? 'No matching skills found' : 'No skills yet. Create your first skill to get started.'}
          </p>
          {!showSearchResults && <Button onClick={handleCreate}>+ Create Skill</Button>}
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {skillsToDisplay.map((skill) => (
              <Card key={skill.id} className="hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-slate-900">
                        {skill.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(skill.status)}`}>
                        {skill.status}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                        {getVisibilityText(skill.visibility)}
                      </span>
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="flex gap-1">
                          {skill.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-sm text-slate-600 mb-2">{skill.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {skill.category && (
                        <span>Category: {skill.category}</span>
                      )}
                      <span>Version: {skill.version || '1.0'}</span>
                      <span>Executions: {skill.execution_count || 0}</span>
                      <span>Subscribers: {skill.subscriber_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(skill)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(skill.id)}
                      disabled={deletingId === skill.id}
                    >
                      {deletingId === skill.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {showSearchResults && searchTotal > searchPageSize && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={handlePrevPage}
                disabled={searchPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {searchPage} of {Math.ceil(searchTotal / searchPageSize)}
              </span>
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={searchPage >= Math.ceil(searchTotal / searchPageSize)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

    </>
  )
}