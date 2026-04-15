import { useState, useEffect } from 'react'
import { Button } from './Button'
import type { Skill, SkillStatus, SkillVisibility, CreateSkillRequest, UpdateSkillRequest } from '../types'

interface CreateEditSkillFormProps {
  skill?: Skill | null
  onConfirm: (data: CreateSkillRequest | UpdateSkillRequest) => void
  onCancel?: () => void
  loading?: boolean
}

const visibilityOptions: { value: SkillVisibility; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Only visible to you' },
  { value: 'public', label: 'Public', description: 'Visible to all users' },
]

const statusOptions: { value: SkillStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Not executable' },
  { value: 'published', label: 'Published', description: 'Published and executable' },
  { value: 'archived', label: 'Archived', description: 'Archived, not executable' },
]

export function CreateEditSkillDialog({ skill, onConfirm, onCancel, loading }: CreateEditSkillFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<SkillVisibility>('private')
  const [status, setStatus] = useState<SkillStatus>('draft')
  const [tags, setTags] = useState('')

  // Reset form when skill changes
  useEffect(() => {
    if (skill) {
      // Edit mode
      setName(skill.name)
      setDescription(skill.description || '')
      setCategory(skill.category || '')
      setContent(skill.content)
      setVisibility(skill.visibility)
      setStatus(skill.status)
      setTags(skill.tags?.join(', ') || '')
    } else {
      // Create mode
      setName('')
      setDescription('')
      setCategory('')
      setContent('')
      setVisibility('private')
      setStatus('draft')
      setTags('')
    }
  }, [skill])


  const handleSubmit = (type?: 'saveDraft' | 'publish' | 'archive') => {
    if (!name.trim() || !content.trim()) return

    // Determine default action type if not provided
    let finalActionType = type
    if (!finalActionType) {
      if (!skill) {
        // Create mode: default to publish
        finalActionType = 'publish'
      } else {
        // Edit mode: default based on current status
        if (skill.status === 'published') {
          finalActionType = 'archive'
        } else if (skill.status === 'archived') {
          finalActionType = 'publish'
        } else {
          // draft or other
          finalActionType = 'saveDraft'
        }
      }
    }

    // Determine status based on action type
    let newStatus: SkillStatus | undefined
    if (!skill) {
      // Create mode
      newStatus = finalActionType === 'publish' ? 'published' : 'draft'
    } else {
      // Edit mode
      if (finalActionType === 'archive') {
        newStatus = 'archived'
      } else if (finalActionType === 'publish') {
        newStatus = 'published'
      } else if (finalActionType === 'saveDraft') {
        newStatus = 'draft'
      }
    }

    const baseData: CreateSkillRequest | UpdateSkillRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      content: content.trim(),
      visibility,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
    }

    // Include status only when needed
    const data = newStatus !== undefined ? { ...baseData, status: newStatus } : baseData

    onConfirm(data)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && name.trim() && content.trim()) {
      handleSubmit()
    }
  }

  const isPublished = skill?.status === 'published'

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 w-full p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          {skill ? 'Edit Skill' : 'Create New Skill'}
        </h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Skill Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Daily News Summarizer"
                autoFocus
                disabled={isPublished}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Productivity, News, Analytics"
                disabled={isPublished}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what this skill does..."
              rows={2}
              disabled={isPublished}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Skill Content (Markdown) *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Follow Anthropic skill format...
Example:
# My Skill
Description: This skill does something useful.

## Parameters
- name: string
- count: number`}
              rows={8}
              disabled={isPublished}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm resize-y disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use markdown following Anthropic skill format. Ctrl+Enter to save.
            </p>
          </div>

          <div className={`grid ${skill ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div className={skill ? '' : 'col-span-1'}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Visibility
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((option) => (
                  <label key={option.value} className="flex items-start">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={(e) => setVisibility(e.target.value as SkillVisibility)}
                      disabled={isPublished}
                      className="mt-0.5 mr-2 disabled:opacity-50"
                    />
                    <div>
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {skill && !isPublished && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <label key={option.value} className="flex items-start">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={status === option.value}
                        onChange={(e) => setStatus(e.target.value as SkillStatus)}
                        disabled={isPublished}
                        className="mt-0.5 mr-2 disabled:opacity-50"
                      />
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-slate-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="news, summary, daily"
              disabled={isPublished}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
            />
          </div>

        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>

          {!skill ? (
            // Create mode: Save Draft and Publish buttons
            <>
              <Button
                onClick={() => handleSubmit('saveDraft')}
                disabled={!name.trim() || !content.trim() || loading}
                variant="secondary"
              >
                {loading ? 'Creating...' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('publish')}
                disabled={!name.trim() || !content.trim() || loading}
              >
                {loading ? 'Creating...' : 'Publish'}
              </Button>
            </>
          ) : skill.status === 'published' ? (
            // Edit mode: Published skill - Archive button only
            <Button
              onClick={() => handleSubmit('archive')}
              disabled={loading}
              variant="danger"
            >
              {loading ? 'Archiving...' : 'Archive'}
            </Button>
          ) : skill.status === 'archived' ? (
            // Edit mode: Archived skill - Publish button
            <Button
              onClick={() => handleSubmit('publish')}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          ) : (
            // Edit mode: Draft skill - Save Draft and Publish buttons
            <>
              <Button
                onClick={() => handleSubmit('saveDraft')}
                disabled={!name.trim() || !content.trim() || loading}
                variant="secondary"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('publish')}
                disabled={!name.trim() || !content.trim() || loading}
              >
                {loading ? 'Publishing...' : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }