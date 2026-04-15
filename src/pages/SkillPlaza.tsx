import { useState } from 'react'
import { searchSkills, subscribeToSkill } from '../lib/api'
import type { Skill, SearchSkillsResponse } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function SkillPlaza() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [results, setResults] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [subscribingId, setSubscribingId] = useState<number | null>(null)

  const handleSearch = async (p = 1) => {
    try {
      setLoading(true)
      let query = searchQuery
      if (searchCategory) {
        query = query ? `${query} category:${searchCategory}` : `category:${searchCategory}`
      }
      const response: SearchSkillsResponse = await searchSkills({
        q: query || undefined,
        page: p,
        size: pageSize,
      })
      setResults(response.data)
      setTotal(response.total)
      setPage(response.page || p)
      setPageSize(response.size || pageSize)
      setSearched(true)
    } catch (err) {
      console.error('search error:', err)
      alert('Failed to search skills')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (skillId: number) => {
    setSubscribingId(skillId)
    try {
      await subscribeToSkill(skillId, { config: {} })
      alert('Subscribed successfully!')
    } catch (err) {
      console.error('subscribe error:', err)
      alert('Failed to subscribe to skill')
    } finally {
      setSubscribingId(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Skill Plaza</h1>
        <p className="text-sm text-slate-500 mt-1">Discover and subscribe to public skills</p>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Skills</label>
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
              <Button onClick={() => handleSearch()} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
              {searched && (
                <Button variant="secondary" onClick={() => { setSearchQuery(''); setSearchCategory(''); setSearched(false) }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {!searched ? (
        <Card className="text-center py-16">
          <p className="text-slate-500">Search for public skills to get started.</p>
        </Card>
      ) : results.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500">No matching skills found.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {results.map((skill) => (
              <Card key={skill.id} className="hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-slate-900">{skill.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        published
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
                      <span>Subscribers: {skill.subscriber_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSubscribe(skill.id)}
                      disabled={subscribingId === skill.id}
                    >
                      {subscribingId === skill.id ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="secondary" onClick={() => handleSearch(page - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="secondary" onClick={() => handleSearch(page + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}
