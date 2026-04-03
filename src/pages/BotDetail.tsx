import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBot, updateBot, deleteBot } from '../lib/api'
import type { Bot } from '../types'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { QRCodeSVG } from 'qrcode.react'

export function BotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bot, setBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!id) return
    loadBot()
  }, [id])

  const loadBot = async () => {
    try {
      const data = await getBot(Number(id))
      setBot(data)
      setName(data.name)
      setDescription(data.description)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!bot) return
    setSaving(true)
    try {
      const updated = await updateBot(bot.id, { name, description })
      setBot(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!bot) return
    await deleteBot(bot.id)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-sm text-slate-400">Loading...</p>
        </main>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-sm text-slate-500">Bot not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-900">
            {bot.name || `Bot #${bot.id}`}
          </h1>
          <StatusBadge status={bot.status} />
        </div>

        <div className="space-y-4">
          {/* Bot Info */}
          <Card>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">{bot.name || 'Unnamed'}</p>
                    <p className="text-sm text-slate-500 mt-2">Description</p>
                    <p className="text-slate-700">{bot.description || 'No description'}</p>
                  </div>
                  <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
                </div>
              </div>
            )}
          </Card>

          {/* QR Code for pending bots */}
          {bot.status === 'pending' && (
            <Card>
              <h2 className="text-sm font-medium text-slate-900 mb-3">Bind Bot via iLink</h2>
              <p className="text-sm text-slate-500 mb-4">
                Scan this QR code with your WeChat to bind the bot.
              </p>
              {bot.qrcode_image ? (
                <div className="flex justify-center">
                  <QRCodeSVG value={bot.qrcode_image} size={192} />
                </div>
              ) : (
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <p className="text-sm text-slate-400">QR code not available</p>
                </div>
              )}
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-100">
            <h2 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 mb-3">
              Once deleted, the bot cannot be recovered.
            </p>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Bot</Button>
          </Card>
        </div>
      </main>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Bot"
        message="Are you sure you want to delete this bot? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
