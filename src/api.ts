import type { Role } from './data'

export type AuthUser = {
  id: string
  username: string
  role: Role
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null
    throw new ApiError(body?.detail || `Request failed (${response.status})`, response.status)
  }

  return response
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await request('/auth/me')
    return await response.json() as AuthUser
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function signIn(username: string, password: string): Promise<AuthUser> {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return await response.json() as AuthUser
}

export async function signOut(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}
