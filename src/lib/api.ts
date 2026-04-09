import { authApi } from './auth'
import type { Bot, Channel, CreateBotRequest, UpdateBotRequest, UpdateProfileRequest, User } from '../types'

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

export async function deleteChannel(botId: number, channelId: number): Promise<void> {
  await authApi.delete(`bots/${botId}/channels/${channelId}`)
}
