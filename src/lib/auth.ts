import { startRegistration } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'
import ky from 'ky'
import type { AuthResponse, BeginAuthRequest } from '../types'

const api = ky.create({ prefixUrl: '/api/v1' })

let token: string | null = null

export function getToken(): string | null {
  return token
}

export function setToken(t: string | null) {
  token = t
}

export function isAuthenticated(): boolean {
  return token !== null
}

export function getAuthHeaders(): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

const authApi = ky.create({
  prefixUrl: '/api/v1',
  hooks: {
    beforeRequest: [
      (request) => {
        const t = getToken()
        if (t) {
          request.headers.set('Authorization', `Bearer ${t}`)
        }
      },
    ],
  },
})

export { authApi }

export async function loginWithPasskey(username?: string): Promise<AuthResponse> {
  // Step 1: Start auth - get WebAuthn challenge
  const startBody: BeginAuthRequest = {}
  if (username) startBody.username = username

  const creationOptions = await api.post('auth/start', { json: startBody }).json<{ publicKey: PublicKeyCredentialCreationOptionsJSON }>()

  // Step 2: Browser Passkey dialog
  const credential = await startRegistration({ optionsJSON: creationOptions.publicKey })

  // Step 3: Finish auth - send credential to server
  const response = await api
    .post('auth/finish', { json: credential })
    .json<AuthResponse>()

  setToken(response.token)
  return response
}

export function logout() {
  setToken(null)
}
