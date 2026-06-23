import { getAccessToken } from '@/lib/auth/token'
import type { MediaType } from '@/graphql/types'

// The upload endpoint lives on the backend origin, next to /graphql.
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql'
const API_ORIGIN = GRAPHQL_URL.replace(/\/graphql\/?$/, '')

export interface UploadedMedia {
  url: string
  type: MediaType
}

/**
 * Upload a single image/video file to the backend and get back its public URL
 * and detected media type, ready to attach to a createPost call.
 */
export async function uploadFile(file: File): Promise<UploadedMedia> {
  const form = new FormData()
  form.append('file', file)

  const token = getAccessToken()
  const res = await fetch(`${API_ORIGIN}/uploads`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    body: form,
    credentials: 'include',
  })

  if (!res.ok) {
    let message = `Upload failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string | string[] }
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
      }
    } catch {
      // Non-JSON error body — keep the status-code message.
    }
    throw new Error(message)
  }

  return (await res.json()) as UploadedMedia
}
