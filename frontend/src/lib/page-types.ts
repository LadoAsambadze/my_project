import {
  Camera,
  Palette,
  UtensilsCrossed,
  Flower2,
  Music,
  type LucideIcon,
} from 'lucide-react'
import type { PageType } from '@/graphql/types'

// Selectable page types — the kinds of event vendors, in the order shown in
// the create-page type picker. Keep in sync with the backend PageType enum and
// the `pageTypes` i18n namespace.
export const PAGE_TYPES: PageType[] = [
  'PHOTOGRAPHER',
  'DESIGNER',
  'CATERING',
  'FLORIST',
  'MUSIC_SOUND',
]

// Icon shown alongside each page type. Keys match the backend PageType enum and
// the `pageTypes` i18n namespace.
export const PAGE_TYPE_ICONS: Record<PageType, LucideIcon> = {
  PHOTOGRAPHER: Camera,
  DESIGNER: Palette,
  CATERING: UtensilsCrossed,
  FLORIST: Flower2,
  MUSIC_SOUND: Music,
}
