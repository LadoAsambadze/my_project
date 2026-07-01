import {
  Gem,
  Cake,
  Heart,
  Briefcase,
  PartyPopper,
  Baby,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface DesignOccasionOption {
  id: string
  icon: LucideIcon
}

// Occasions a design can be made for, in the order shown in the design
// composer and the browse filter. Ids are stored verbatim in Design.occasion
// (mirroring how Event.subtype works); labels live in the `designOccasions`
// i18n namespace.
export const DESIGN_OCCASIONS: DesignOccasionOption[] = [
  { id: 'WEDDING', icon: Gem },
  { id: 'BIRTHDAY', icon: Cake },
  { id: 'ANNIVERSARY', icon: Heart },
  { id: 'CORPORATE', icon: Briefcase },
  { id: 'PARTY', icon: PartyPopper },
  { id: 'BABY_SHOWER', icon: Baby },
  { id: 'OTHER', icon: Sparkles },
]

/** Icon for a stored occasion id (Sparkles for unknown ids). */
export function occasionIcon(id: string): LucideIcon {
  return DESIGN_OCCASIONS.find((o) => o.id === id)?.icon ?? Sparkles
}
