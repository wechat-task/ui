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

export interface SendMessageRequest {
  text: string
}

export interface UpdateProfileRequest {
  username?: string
  icon?: string
}

// Skill types
export type SkillStatus = 'draft' | 'published' | 'archived'

export type SkillVisibility = 'private' | 'public' | 'unlisted'

export interface SkillParameter {
  default?: any
  description?: string
  enum_values?: string[]
  required?: boolean
  type?: string
}

export interface SkillParameters {
  [key: string]: SkillParameter
}

export interface LLMConfig {
  api_key?: string
  base_url?: string
  max_tokens?: number
  model?: string
  provider?: string
  temperature?: number
}

export interface SkillExecutionConfig {
  llm_config?: LLMConfig
  parameters?: Record<string, any>
}

export interface Skill {
  id: number
  user_id: number
  name: string
  description?: string
  category?: string
  content: string
  status: SkillStatus
  visibility: SkillVisibility
  parameters?: SkillParameters
  schedule_cron?: string
  max_tokens?: number
  is_free?: boolean
  uses_system_llm?: boolean
  version?: string
  tags?: string[]
  execution_count?: number
  subscriber_count?: number
  created_at: string
  updated_at: string
}

export interface SkillSubscription {
  id: number
  user_id: number
  skill_id: number
  bot_id: number
  channel_id: number
  status: string
  schedule_cron?: string
  time_zone?: string
  next_run_at?: string
  config?: SkillExecutionConfig
  created_at: string
  updated_at: string
  skill?: Skill
  bot?: Bot
  channel?: Channel
}

export interface CreateSkillRequest {
  name: string
  description?: string
  category?: string
  content: string
  visibility?: SkillVisibility
  parameters?: SkillParameters
  schedule_cron?: string
  max_tokens?: number
  is_free?: boolean
  uses_system_llm?: boolean
  version?: string
  tags?: string[]
}

export interface UpdateSkillRequest {
  name?: string
  description?: string
  category?: string
  content?: string
  visibility?: SkillVisibility
  parameters?: SkillParameters
  schedule_cron?: string
  max_tokens?: number
  is_free?: boolean
  uses_system_llm?: boolean
  version?: string
  tags?: string[]
}

export interface SubscribeToSkillRequest {
  bot_id: number
  channel_id: number
  schedule_cron?: string
  time_zone?: string
  config?: SkillExecutionConfig
}

export interface SearchSkillsRequest {
  query?: string
  category?: string
  visibility?: SkillVisibility
  limit?: number
  offset?: number
}
