import { useEffect, useState } from 'react'
import { listSubscriptions, unsubscribeFromSkill } from '../lib/api'
import type { SkillSubscription } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SkillSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const data = await listSubscriptions()
      setSubscriptions(data)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async (skillId: number) => {
    if (!confirm('Are you sure you want to unsubscribe from this skill?')) return
    setUnsubscribingId(skillId)
    try {
      await unsubscribeFromSkill(skillId)
      setSubscriptions(subscriptions.filter(s => s.skill_id !== skillId))
    } catch (err) {
      console.error('unsubscribe error:', err)
      alert('Failed to unsubscribe')
    } finally {
      setUnsubscribingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">My Subscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">Skills you have subscribed to</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : subscriptions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">You haven't subscribed to any skills yet.</p>
          <p className="text-sm text-slate-400">Browse the Skill Plaza to discover and subscribe to public skills.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-slate-900">
                      {sub.skill?.name || `Skill #${sub.skill_id}`}
                    </h3>
                    {sub.status && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {sub.status}
                      </span>
                    )}
                  </div>
                  {sub.skill?.description && (
                    <p className="text-sm text-slate-600 mb-2">{sub.skill.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {sub.bot?.name && <span>Bot: {sub.bot.name}</span>}
                    {sub.channel && <span>Channel: {sub.channel.type}</span>}
                    <span>Subscribed: {formatDate(sub.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleUnsubscribe(sub.skill_id)}
                    disabled={unsubscribingId === sub.skill_id}
                  >
                    {unsubscribingId === sub.skill_id ? 'Unsubscribing...' : 'Unsubscribe'}
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
