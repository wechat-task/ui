import { useEffect, useState } from 'react'
import { listMySkills, deleteSkill, createSkill, updateSkill, publishSkill, archiveSkill } from '../lib/api'
import type { Skill, CreateSkillRequest, UpdateSkillRequest } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { CreateEditSkillDialog } from '../components/CreateEditSkillDialog'

export function MySkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [saving, setSaving] = useState(false)

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

  const handleSaveSkill = async (data: CreateSkillRequest | UpdateSkillRequest, action: 'saveDraft' | 'publish' | 'archive') => {
    try {
      setSaving(true)

      if (!editingSkill) {
        // Create mode
        const status = action === 'publish' ? 'published' : 'draft'
        const newSkill = await createSkill({ ...data, status } as CreateSkillRequest)
        setSkills([newSkill, ...skills])
      } else {
        // Edit mode
        if (action === 'archive') {
          const updatedSkill = await archiveSkill(editingSkill.id)
          setSkills(skills.map(s => s.id === editingSkill.id ? updatedSkill : s))
        } else if (action === 'publish') {
          // Save changes first, then publish
          await updateSkill(editingSkill.id, data as UpdateSkillRequest)
          const updatedSkill = await publishSkill(editingSkill.id)
          setSkills(skills.map(s => s.id === editingSkill.id ? updatedSkill : s))
        } else {
          // Save draft
          const updatedSkill = await updateSkill(editingSkill.id, data as UpdateSkillRequest)
          setSkills(skills.map(s => s.id === editingSkill.id ? updatedSkill : s))
        }
      }

      setShowCreateForm(false)
      setEditingSkill(null)
    } catch (err) {
      console.error('save skill error:', err)
      alert(`Failed to ${action === 'archive' ? 'archive' : editingSkill ? 'update' : 'create'} skill`)
    } finally {
      setSaving(false)
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
      default: return visibility
    }
  }

  const isFormVisible = editingSkill || showCreateForm

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {isFormVisible ? (editingSkill ? 'Edit Skill' : 'Create Skill') : 'My Skills'}
        </h1>
        {isFormVisible ? (
          <Button variant="secondary" onClick={() => { setShowCreateForm(false); setEditingSkill(null) }}>
            Back to list
          </Button>
        ) : (
          <Button onClick={handleCreate}>+ Create Skill</Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : isFormVisible ? (
        <CreateEditSkillDialog
          skill={editingSkill}
          onConfirm={handleSaveSkill}
          onCancel={() => { setShowCreateForm(false); setEditingSkill(null) }}
          loading={saving}
        />
      ) : skills.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">No skills yet. Create your first skill to get started.</p>
          <Button onClick={handleCreate}>+ Create Skill</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-slate-900">{skill.name}</h3>
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
                    {skill.category && <span>Category: {skill.category}</span>}
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
      )}
    </>
  )
}
