import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HTTPError } from 'ky'
import { getBot, updateBot, deleteBot, createWechatChannel, createLarkChannel, deleteChannel, sendMessage } from '../lib/api'
import type { Bot, Channel, ChannelType } from '../types'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { QRCodeSVG } from 'qrcode.react'

const CHANNEL_INFO: Record<ChannelType, { label: string; description: string }> = {
  wechat_clawbot: { label: 'WeChat', description: 'Connect via iLink protocol' },
  lark: { label: 'Lark', description: 'Connect via Lark Bot' },
}

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
  const [showDeleteChannelConfirm, setShowDeleteChannelConfirm] = useState<Channel | null>(null)

  // Channel states
  const [connectingWechat, setConnectingWechat] = useState(false)
  const [qrcodeData, setQrcodeData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLarkDialog, setShowLarkDialog] = useState(false)
  const [larkWebhookUrl, setLarkWebhookUrl] = useState('')
  const [larkSecret, setLarkSecret] = useState('')
  const [connectingLark, setConnectingLark] = useState(false)
  const [messageText, setMessageText] = useState<Record<number, string>>({})
  const [sendingMessage, setSendingMessage] = useState<number | null>(null)
  const [messageError, setMessageError] = useState<Record<number, string>>({})
  const [messageSuccess, setMessageSuccess] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!id) return
    loadBot()
  }, [id])

  // Poll channel status when wechat channel is pending
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const wechat = bot?.channels?.find((c) => c.type === 'wechat_clawbot')
    if (wechat?.status === 'pending' && id) {
      if (pollRef.current) return
      pollRef.current = setInterval(async () => {
        try {
          const data = await getBot(Number(id))
          setBot(data)
          const updatedWechat = data.channels?.find((c) => c.type === 'wechat_clawbot')
          if (updatedWechat && updatedWechat.status !== 'pending') {
            setQrcodeData(null)
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
          }
        } catch {
          // ignore poll errors
        }
      }, 5000)
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [bot?.channels, id])

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

  const handleConnectWechat = async () => {
    if (!bot) return
    setConnectingWechat(true)
    setError(null)
    setQrcodeData(null)
    try {
      const res = await createWechatChannel(bot.id)
      if (res.qrcode_image) {
        setQrcodeData(res.qrcode_image)
      }
      await loadBot()
    } catch (err) {
      setError('Failed to create WeChat channel. Please try again.')
      console.error('createWechatChannel error:', err)
    } finally {
      setConnectingWechat(false)
    }
  }

  const handleConnectLark = async () => {
    if (!bot) return
    setConnectingLark(true)
    setError(null)
    try {
      await createLarkChannel(bot.id, {
        webhook_url: larkWebhookUrl.trim(),
        secret: larkSecret.trim() || undefined,
      })
      setShowLarkDialog(false)
      setLarkWebhookUrl('')
      setLarkSecret('')
      await loadBot()
    } catch (err) {
      setError('Failed to create Lark channel. Please check the webhook URL.')
      console.error('createLarkChannel error:', err)
    } finally {
      setConnectingLark(false)
    }
  }

  const handleDeleteChannel = async (channel: Channel) => {
    if (!bot) return
    try {
      await deleteChannel(bot.id, channel.id)
      setQrcodeData(null)
      await loadBot()
    } catch (err) {
      console.error('deleteChannel error:', err)
    }
    setShowDeleteChannelConfirm(null)
  }

  const handleSendMessage = async (channel: Channel) => {
    if (!bot) return
    const text = messageText[channel.id]?.trim()
    if (!text) return
    setSendingMessage(channel.id)
    setMessageError((prev) => ({ ...prev, [channel.id]: '' }))
    setMessageSuccess((prev) => ({ ...prev, [channel.id]: '' }))
    try {
      await sendMessage(bot.id, channel.id, { text })
      setMessageText((prev) => ({ ...prev, [channel.id]: '' }))
      setMessageSuccess((prev) => ({ ...prev, [channel.id]: 'Message sent' }))
      setTimeout(() => {
        setMessageSuccess((prev) => ({ ...prev, [channel.id]: '' }))
      }, 3000)
    } catch (err: unknown) {
      let msg = 'Failed to send message'
      if (err instanceof HTTPError) {
        try {
          const body = await err.response.json() as Record<string, string>
          msg = body.error || body.message || err.message
        } catch {
          msg = err.message
        }
      } else if (err instanceof Error) {
        msg = err.message
      }
      setMessageError((prev) => ({ ...prev, [channel.id]: msg }))
    } finally {
      setSendingMessage(null)
    }
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

  const channels = bot.channels || []
  const wechatChannel = channels.find((c) => c.type === 'wechat_clawbot')
  const larkChannel = channels.find((c) => c.type === 'lark')

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
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">{bot.name || 'Unnamed'}</p>
                  <p className="text-sm text-slate-500 mt-2">Description</p>
                  <p className="text-slate-700">{bot.description || 'No description'}</p>
                </div>
                <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
              </div>
            )}
          </Card>

          {/* Channels */}
          <Card>
            <h2 className="text-sm font-medium text-slate-900 mb-4">Channels</h2>
            <p className="text-sm text-slate-500 mb-4">
              Connect this bot to messaging platforms.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {/* WeChat */}
              <div className="flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{CHANNEL_INFO.wechat_clawbot.label}</p>
                  <p className="text-xs text-slate-500">{CHANNEL_INFO.wechat_clawbot.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {wechatChannel && <StatusBadge status={wechatChannel.status} />}
                  {wechatChannel ? (
                    <Button variant="danger" onClick={() => setShowDeleteChannelConfirm(wechatChannel)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnectWechat} disabled={connectingWechat}>
                      {connectingWechat ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Lark */}
              <div className="flex items-center justify-between py-3 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{CHANNEL_INFO.lark.label}</p>
                  <p className="text-xs text-slate-500">{CHANNEL_INFO.lark.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {larkChannel && <StatusBadge status={larkChannel.status} />}
                  {larkChannel ? (
                    <Button variant="danger" onClick={() => setShowDeleteChannelConfirm(larkChannel)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => setShowLarkDialog(true)}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* QR Code (shown after creating wechat channel) */}
          {qrcodeData && wechatChannel?.status === 'pending' && (
            <Card>
              <h2 className="text-sm font-medium text-slate-900 mb-3">Scan QR Code</h2>
              <p className="text-sm text-slate-500 mb-4">
                Scan this QR code with your WeChat to bind the channel.
              </p>
              <div className="flex justify-center">
                <QRCodeSVG value={qrcodeData} size={192} />
              </div>
            </Card>
          )}

          {/* Send Message */}
          {channels.filter((c) => c.status === 'active').length > 0 && (
            <Card>
              <h2 className="text-sm font-medium text-slate-900 mb-4">Send Message</h2>
              <p className="text-sm text-slate-500 mb-4">
                Send a test message to an active channel.
              </p>
              <div className="space-y-3">
                {channels.filter((c) => c.status === 'active').map((channel) => (
                  <div key={channel.id}>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-600 whitespace-nowrap self-center">
                        {CHANNEL_INFO[channel.type].label}
                      </span>
                      <input
                        value={messageText[channel.id] || ''}
                        onChange={(e) => {
                          setMessageText((prev) => ({ ...prev, [channel.id]: e.target.value }))
                          if (messageError[channel.id]) {
                            setMessageError((prev) => ({ ...prev, [channel.id]: '' }))
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && messageText[channel.id]?.trim()) {
                            e.preventDefault()
                            handleSendMessage(channel)
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <Button
                        onClick={() => handleSendMessage(channel)}
                        disabled={!messageText[channel.id]?.trim() || sendingMessage === channel.id}
                      >
                        {sendingMessage === channel.id ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                    {messageError[channel.id] && (
                      <p className="text-xs text-red-600 mt-1 ml-12">{messageError[channel.id]}</p>
                    )}
                    {messageSuccess[channel.id] && (
                      <p className="text-xs text-emerald-600 mt-1 ml-12">{messageSuccess[channel.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-100">
            <h2 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 mb-3">
              Once deleted, the bot and all its channels cannot be recovered.
            </p>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Bot</Button>
          </Card>
        </div>
      </main>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Bot"
        message="Are you sure you want to delete this bot and all its channels? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showDeleteChannelConfirm && (
        <ConfirmDialog
          open={true}
          title="Disconnect Channel"
          message={`Are you sure you want to disconnect ${CHANNEL_INFO[showDeleteChannelConfirm.type].label}?`}
          confirmLabel="Disconnect"
          onConfirm={() => handleDeleteChannel(showDeleteChannelConfirm)}
          onCancel={() => setShowDeleteChannelConfirm(null)}
        />
      )}

      {/* Lark Connect Dialog */}
      {showLarkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowLarkDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg border border-slate-200 w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Connect Lark</h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Webhook URL <span className="text-red-500">*</span>
                </label>
                <input
                  value={larkWebhookUrl}
                  onChange={(e) => setLarkWebhookUrl(e.target.value)}
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Secret <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  value={larkSecret}
                  onChange={(e) => setLarkSecret(e.target.value)}
                  placeholder="Signing secret"
                  type="password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowLarkDialog(false); setLarkWebhookUrl(''); setLarkSecret('') }}>Cancel</Button>
              <Button onClick={handleConnectLark} disabled={!larkWebhookUrl.trim() || connectingLark}>
                {connectingLark ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
