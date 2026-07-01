import {
  Gem,
  Flower2,
  LayoutGrid,
  Gift,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface FloristKindOption {
  id: string
  icon: LucideIcon
}

// Kinds of florist arrangements, in composer order. Ids are stored verbatim
// in FloristItem.kind; labels live in the `floristKinds` i18n namespace.
export const FLORIST_KINDS: FloristKindOption[] = [
  { id: 'WEDDING_BOUQUET', icon: Gem },
  { id: 'TABLE_DECOR', icon: LayoutGrid },
  { id: 'ARCH_INSTALLATION', icon: Flower2 },
  { id: 'GIFT_BOUQUET', icon: Gift },
  { id: 'OTHER', icon: Sparkles },
]

/** Icon for a stored kind id (Sparkles for unknown ids). */
export function floristKindIcon(id: string): LucideIcon {
  return FLORIST_KINDS.find((k) => k.id === id)?.icon ?? Sparkles
}
