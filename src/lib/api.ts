import { authApi } from './auth'
import type { Bot, Channel, CreateBotRequest, CreateLarkChannelRequest, SendMessageRequest, UpdateBotRequest, UpdateProfileRequest, User, Skill, SkillSubscription, CreateSkillRequest, UpdateSkillRequest, SubscribeToSkillRequest, SearchSkillsRequest, SearchSkillsResponse } from '../types'

// User
export async function getCurrentUser(): Promise<User> {
  return authApi.get('user/me').json()
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return authApi.put('user/profile', { json: data }).json()
}

// Bot
export async function listBots(): Promise<Bot[]> {
  return authApi.get('bots').json()
}

export async function getBot(id: number): Promise<Bot> {
  return authApi.get(`bots/${id}`).json()
}

export async function createBot(data: CreateBotRequest): Promise<Bot> {
  return authApi.post('bots', { json: data }).json()
}

export async function updateBot(id: number, data: UpdateBotRequest): Promise<Bot> {
  return authApi.put(`bots/${id}`, { json: data }).json()
}

export async function deleteBot(id: number): Promise<void> {
  await authApi.delete(`bots/${id}`)
}

// Channel
export async function listChannels(botId: number): Promise<Channel[]> {
  return authApi.get(`bots/${botId}/channels`).json()
}

export async function createWechatChannel(botId: number): Promise<Channel & { qrcode_image?: string }> {
  return authApi.post(`bots/${botId}/channels/wechat-clawbot`).json()
}

export async function createLarkChannel(botId: number, data: CreateLarkChannelRequest): Promise<Channel> {
  return authApi.post(`bots/${botId}/channels/lark`, { json: data }).json()
}

export async function deleteChannel(botId: number, channelId: number): Promise<void> {
  await authApi.delete(`bots/${botId}/channels/${channelId}`)
}

export async function sendMessage(botId: number, channelId: number, data: SendMessageRequest): Promise<void> {
  await authApi.post(`bots/${botId}/channels/${channelId}/send`, { json: data })
}

// Skill
export async function listMySkills(): Promise<Skill[]> {
  return authApi.get('skills/me').json()
}

export async function createSkill(data: CreateSkillRequest): Promise<Skill> {
  return authApi.post('skills', { json: data }).json()
}

export async function getSkill(id: number): Promise<Skill> {
  return authApi.get(`skills/${id}`).json()
}

export async function updateSkill(id: number, data: UpdateSkillRequest): Promise<Skill> {
  return authApi.put(`skills/${id}`, { json: data }).json()
}

export async function deleteSkill(id: number): Promise<void> {
  await authApi.delete(`skills/${id}`)
}

export async function searchSkills(data: SearchSkillsRequest): Promise<SearchSkillsResponse> {
  const params = new URLSearchParams()
  if (data.q) params.append('q', data.q)
  if (data.page) params.append('page', data.page.toString())
  if (data.size) params.append('size', data.size.toString())
  return authApi.get(`skills/search?${params.toString()}`).json()
}

export async function listSubscriptions(): Promise<SkillSubscription[]> {
  return authApi.get('skills/subscriptions').json()
}

export async function subscribeToSkill(skillId: number, data: SubscribeToSkillRequest): Promise<SkillSubscription> {
  return authApi.post(`skills/${skillId}/subscribe`, { json: data }).json()
}

export async function unsubscribeFromSkill(skillId: number): Promise<void> {
  await authApi.delete(`skills/${skillId}/subscribe`)
}
