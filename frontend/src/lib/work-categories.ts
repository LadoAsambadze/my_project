import {
  Gem,
  PartyPopper,
  User,
  Camera,
  Plane,
  Building2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface WorkCategoryOption {
  id: string
  icon: LucideIcon
}

// Categories a portfolio work can belong to, in composer order. Ids are
// stored verbatim in Work.category (mirroring Design.occasion); labels live
// in the `workCategories` i18n namespace.
export const WORK_CATEGORIES: WorkCategoryOption[] = [
  { id: 'WEDDING', icon: Gem },
  { id: 'EVENT', icon: PartyPopper },
  { id: 'PORTRAIT', icon: User },
  { id: 'STUDIO', icon: Camera },
  { id: 'DRONE', icon: Plane },
  { id: 'COMMERCIAL', icon: Building2 },
  { id: 'OTHER', icon: Sparkles },
]

/** Icon for a stored category id (Sparkles for unknown ids). */
export function workCategoryIcon(id: string): LucideIcon {
  return WORK_CATEGORIES.find((c) => c.id === id)?.icon ?? Sparkles
}
