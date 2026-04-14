import { useEffect, useState } from 'react'
import { listMySkills, deleteSkill } from '../lib/api'
import type { Skill } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Link } from 'react-router-dom'

export function SkillManagement() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">My Skills</h1>
        <Button>+ Create Skill</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : skills.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">No skills yet. Create your first skill to get started.</p>
          <Button>+ Create Skill</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {skills.map((skill) => (
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
                    {skill.schedule_cron && (
                      <span>Schedule: {skill.schedule_cron}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline">Edit</Button>
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