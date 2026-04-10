export interface User {
  id: number
  username: string
  icon: string
  created_at: string
  updated_at: string
}

export type BotStatus = 'pending' | 'active' | 'disconnected' | 'expired'

export interface Bot {
  id: number
  user_id: number
  name: string
  description: string
  status: BotStatus
  channels: Channel[]
  created_at: string
  updated_at: string
}

export type ChannelType = 'wechat_clawbot' | 'lark'

export type ChannelStatus = 'pending' | 'active' | 'disconnected' | 'expired'

export interface ChannelConfig {
  [key: string]: unknown
}

export interface Channel {
  id: number
  bot_id: number
  type: ChannelType
  status: ChannelStatus
  config: ChannelConfig
  last_cursor: string
  created_at: string
  updated_at: string
}

export interface RegisterOptionsRequest {
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CreateBotRequest {
  name: string
  description?: string
}

export interface UpdateBotRequest {
  name?: string
  description?: string
}

export interface CreateLarkChannelRequest {
  webhook_url: string
  secret?: string
}

export interface UpdateProfileRequest {
  username?: string
  icon?: string
}
