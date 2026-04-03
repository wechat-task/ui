import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listBots, createBot } from '../lib/api'
import type { Bot } from '../types'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'

export function Dashboard() {
  const navigate = useNavigate()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
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

  const handleCreateBot = async () => {
    setCreating(true)
    try {
      const res = await createBot()
      navigate(`/dashboard/bots/${res.bot.id}`, { state: { qrcode_image: res.qrcode_image } })
    } catch (err) {
      console.error('createBot error:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">My Bots</h1>
          <Button onClick={handleCreateBot} disabled={creating}>
            {creating ? 'Creating...' : '+ Add Bot'}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : bots.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500 mb-4">No bots yet. Add your first bot to get started.</p>
            <Button onClick={handleCreateBot} disabled={creating}>
              {creating ? 'Creating...' : '+ Add Bot'}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bots.map((bot) => (
              <Link key={bot.id} to={`/dashboard/bots/${bot.id}`}>
                <Card className="hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {bot.name || `Bot #${bot.id}`}
                      </h3>
                      {bot.description && (
                        <p className="text-sm text-slate-500 mt-1">{bot.description}</p>
                      )}
                    </div>
                    <StatusBadge status={bot.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
