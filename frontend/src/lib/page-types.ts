import { Camera, type LucideIcon } from 'lucide-react'
import type { PageType } from '@/graphql/types'

// Selectable page types. A single type for now; add more here (and to the
// backend PageType enum + the `pageTypes` i18n namespace) to expand.
export const PAGE_TYPES: PageType[] = ['PHOTOGRAPHER']

// Icon shown alongside each page type. Keys match the backend PageType enum and
// the `pageTypes` i18n namespace.
export const PAGE_TYPE_ICONS: Record<PageType, LucideIcon> = {
  PHOTOGRAPHER: Camera,
}
