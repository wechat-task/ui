import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listBots, createBot } from '../lib/api'
import type { Bot } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { CreateBotDialog } from '../components/CreateBotDialog'

export function Dashboard() {
  const navigate = useNavigate()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      const data = await listBots()
      setBots(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBot = async (name: string, description: string) => {
    setCreating(true)
    try {
      const bot = await createBot({ name, description: description || undefined })
      navigate(`/dashboard/bots/${bot.id}`)
    } catch (err) {
      console.error('createBot error:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">My Bots</h1>
        <Button onClick={() => setShowCreateDialog(true)}>+ Add Bot</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : bots.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">No bots yet. Create your first bot to get started.</p>
          <Button onClick={() => setShowCreateDialog(true)}>+ Add Bot</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bots.map((bot) => (
            <Link key={bot.id} to={`bots/${bot.id}`}>
              <Card className="hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {bot.name || `Bot #${bot.id}`}
                    </h3>
                    {bot.description && (
                      <p className="text-sm text-slate-500 mt-1">{bot.description}</p>
                    )}
                    {bot.channels && bot.channels.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {bot.channels.map((ch) => (
                          <span key={ch.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                            {ch.type === 'wechat_clawbot' ? 'WeChat' : 'Lark'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={bot.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateBotDialog
        open={showCreateDialog}
        onConfirm={handleCreateBot}
        onCancel={() => setShowCreateDialog(false)}
        loading={creating}
      />
    </>
  )
}
