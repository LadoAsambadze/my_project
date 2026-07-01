import {
  Music2,
  Piano,
  Guitar,
  Drum,
  Disc3,
  MicVocal,
  Users,
  Theater,
  Speaker,
  Lightbulb,
  Projector,
  Boxes,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { PageType } from '@/graphql/types'

export interface OfferingKindOption {
  id: string
  icon: LucideIcon
}

// Acts a MUSIC_SOUND page can sell. Ids are stored verbatim in Offering.kind;
// labels live in the `offeringKinds` i18n namespace. Also used as the page's
// selectable instruments list.
export const MUSIC_KINDS: OfferingKindOption[] = [
  { id: 'SAXOPHONE', icon: Music2 },
  { id: 'PIANO', icon: Piano },
  { id: 'GUITAR', icon: Guitar },
  { id: 'VIOLIN', icon: Music2 },
  { id: 'DRUMS', icon: Drum },
  { id: 'DJ', icon: Disc3 },
  { id: 'SINGER', icon: MicVocal },
  { id: 'BAND', icon: Users },
  { id: 'FOLK_ENSEMBLE', icon: Theater },
]

// Rentals a MUSIC_SOUND page can list alongside its acts.
export const EQUIPMENT_KINDS: OfferingKindOption[] = [
  { id: 'SOUND_SYSTEM', icon: Speaker },
  { id: 'LIGHTING', icon: Lightbulb },
  { id: 'STAGE', icon: Boxes },
  { id: 'SCREEN_PROJECTOR', icon: Projector },
]

const OTHER: OfferingKindOption = { id: 'OTHER', icon: Sparkles }

/**
 * Kind options for a page. MUSIC_SOUND covers the whole scene — acts and
 * rentals — so it gets both catalogs. OTHER always closes the list.
 */
export function offeringKindsFor(types: PageType[]): OfferingKindOption[] {
  return [
    ...(types.includes('MUSIC_SOUND')
      ? [...MUSIC_KINDS, ...EQUIPMENT_KINDS]
      : []),
    OTHER,
  ]
}

/** Icon for a stored kind id (Sparkles for unknown ids). */
export function offeringKindIcon(id: string): LucideIcon {
  return (
    [...MUSIC_KINDS, ...EQUIPMENT_KINDS, OTHER].find((k) => k.id === id)
      ?.icon ?? Sparkles
  )
}
