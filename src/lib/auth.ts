import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types'
import ky from 'ky'
import type { AuthResponse, RegisterOptionsRequest } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const api = ky.create({ prefixUrl: `${API_BASE}/api/v1` })

const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(t: string | null) {
  if (t) {
    localStorage.setItem(TOKEN_KEY, t)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null
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

interface AuthOptionsResponse<T> {
  options: { publicKey: T }
  session_id: string
}

export async function registerWithPasskey(username: string): Promise<AuthResponse> {
  // Step 1: Get registration options + session ID
  const { options, session_id } = await api
    .post('auth/passkey/register/options', {
      json: { username } satisfies RegisterOptionsRequest,
    })
    .json<AuthOptionsResponse<PublicKeyCredentialCreationOptionsJSON>>()

  // Step 2: Browser Passkey dialog (create credential)
  const credential = await startRegistration({ optionsJSON: options.publicKey })

  // Step 3: Verify registration
  const response = await api
    .post('auth/passkey/register/verify', { json: { ...credential, session_id } })
    .json<AuthResponse>()

  setToken(response.token)
  return response
}

export async function loginWithPasskey(): Promise<AuthResponse> {
  // Step 1: Get login options + session ID
  const { options, session_id } = await api
    .post('auth/passkey/login/options')
    .json<AuthOptionsResponse<PublicKeyCredentialRequestOptionsJSON>>()

  // Step 2: Browser Passkey dialog (authenticate)
  const credential = await startAuthentication({ optionsJSON: options.publicKey })

  // Step 3: Verify login
  const response = await api
    .post('auth/passkey/login/verify', { json: { ...credential, session_id } })
    .json<AuthResponse>()

  setToken(response.token)
  return response
}

export function logout() {
  setToken(null)
}
