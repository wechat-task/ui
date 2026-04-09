import { useState } from 'react'
import { Button } from './Button'

interface CreateBotDialogProps {
  open: boolean
  onConfirm: (name: string, description: string) => void
  onCancel: () => void
  loading?: boolean
}

export function CreateBotDialog({ open, onConfirm, onCancel, loading }: CreateBotDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!open) return null

  const handleSubmit = () => {
    if (!name.trim()) return
    onConfirm(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim() && !e.shiftKey) {
      handleSubmit()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg border border-slate-200 w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Create New Bot</h3>
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bot Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. My Assistant"
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this bot do?"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setName(''); setDescription(''); onCancel() }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}
