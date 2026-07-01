import {
  Utensils,
  UtensilsCrossed,
  Coffee,
  Flame,
  Cake,
  Wine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface CateringKindOption {
  id: string
  icon: LucideIcon
}

// Kinds of catering offers, in the order shown in the offer composer. Ids are
// stored verbatim in CateringOffer.kind (mirroring Design.occasion); labels
// live in the `cateringKinds` i18n namespace.
export const CATERING_KINDS: CateringKindOption[] = [
  { id: 'FURSHET', icon: Utensils },
  { id: 'BANQUET', icon: UtensilsCrossed },
  { id: 'COFFEE_BREAK', icon: Coffee },
  { id: 'BBQ', icon: Flame },
  { id: 'DESSERTS', icon: Cake },
  { id: 'DRINKS', icon: Wine },
  { id: 'OTHER', icon: Sparkles },
]

/** Icon for a stored kind id (Sparkles for unknown ids). */
export function cateringKindIcon(id: string): LucideIcon {
  return CATERING_KINDS.find((k) => k.id === id)?.icon ?? Sparkles
}
