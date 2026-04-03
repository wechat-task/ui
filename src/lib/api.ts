import { authApi } from './auth'
import type { Bot, CreateBotResponse, UpdateBotRequest, UpdateProfileRequest, User } from '../types'

export async function getCurrentUser(): Promise<User> {
  return authApi.get('user/me').json()
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return authApi.put('user/profile', { json: data }).json()
}

export async function listBots(): Promise<Bot[]> {
  return authApi.get('bots').json()
}

export async function getBot(id: number): Promise<Bot> {
  return authApi.get(`bots/${id}`).json()
}

export async function createBot(): Promise<CreateBotResponse> {
  return authApi.post('bots').json()
}

export async function updateBot(id: number, data: UpdateBotRequest): Promise<Bot> {
  return authApi.put(`bots/${id}`, { json: data }).json()
}

export async function deleteBot(id: number): Promise<void> {
  await authApi.delete(`bots/${id}`)
}
