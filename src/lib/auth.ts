import { startRegistration } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'
import ky from 'ky'
import type { AuthResponse, BeginAuthRequest } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const api = ky.create({ prefixUrl: `${API_BASE}/api/v1` })

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

const authApi = ky.create({
  prefixUrl: `${API_BASE}/api/v1`,
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
  // Step 1: Start auth - get WebAuthn challenge + session ID
  const startBody: BeginAuthRequest = {}
  if (username) startBody.username = username

  const startResponse = await api.post('auth/start', { json: startBody })
  const sessionId = startResponse.headers.get('X-Session-Id')
  const creationOptions = await startResponse.json<{ publicKey: PublicKeyCredentialCreationOptionsJSON }>()

  // Step 2: Browser Passkey dialog
  const credential = await startRegistration({ optionsJSON: creationOptions.publicKey })

  // Step 3: Finish auth - send credential + session ID
  const headers: Record<string, string> = {}
  if (sessionId) headers['X-Session-Id'] = sessionId

  const response = await api
    .post('auth/finish', { json: credential, headers })
    .json<AuthResponse>()

  setToken(response.token)
  return response
}

export function logout() {
  setToken(null)
}
