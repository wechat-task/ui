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
  ilink_bot_id: string
  ilink_user_id: string
  base_url: string
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

export interface SetUsernameRequest {
  username: string
}

export interface UpdateBotRequest {
  name?: string
  description?: string
}

export interface CreateBotResponse {
  bot: Bot
  qrcode_image: string
}
