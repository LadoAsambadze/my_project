import {
  PartyPopper,
  Cake,
  Trophy,
  Mountain,
  Tent,
  CalendarDays,
  Goal,
  CircleDot,
  Target,
  Volleyball,
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  Medal,
  HandFist,
  Swords,
  BicepsFlexed,
  Table2,
  Crown,
  MountainSnow,
  Snowflake,
  Sailboat,
  Wind,
  Compass,
  Fish,
  type LucideIcon,
} from 'lucide-react'
import type { EventType } from '@/graphql/types'

// Selectable event types, in the order shown in the composer dropdown. Extend
// by adding values here, to the backend EventType enum, and to the `eventTypes`
// i18n namespace.
export const EVENT_TYPES: EventType[] = [
  'PARTY',
  'BIRTHDAY',
  'SPORT',
  'HIKING',
  'CAMPING',
  'OTHER',
]

// Icon shown alongside each event type. Keys match the backend EventType enum
// and the `eventTypes` i18n namespace.
export const EVENT_TYPE_ICONS: Record<EventType, LucideIcon> = {
  PARTY: PartyPopper,
  BIRTHDAY: Cake,
  SPORT: Trophy,
  HIKING: Mountain,
  CAMPING: Tent,
  OTHER: CalendarDays,
}

export interface EventSubtypeOption {
  id: string
  icon: LucideIcon
}

// Second-level categories within a type. A type absent here (or with an empty
// list) has no subtype step — the composer goes straight to the details form.
// Add a type's subtypes here and their labels to the `eventSubtypes` i18n
// namespace. Ids are stored verbatim in Event.subtype.
//
// The SPORT list covers activities people actually organize in Georgia: ball
// games, the national combat sports (wrestling/judo), chess, winter sports in
// Gudauri/Bakuriani, and outdoor activities (rafting, paragliding, horse
// riding, fishing).
export const EVENT_SUBTYPES: Partial<Record<EventType, EventSubtypeOption[]>> = {
  SPORT: [
    { id: 'FOOTBALL', icon: Goal },
    { id: 'BASKETBALL', icon: CircleDot },
    { id: 'RUGBY', icon: Medal },
    { id: 'WRESTLING', icon: HandFist },
    { id: 'JUDO', icon: Swords },
    { id: 'BOXING', icon: BicepsFlexed },
    { id: 'TENNIS', icon: Target },
    { id: 'TABLE_TENNIS', icon: Table2 },
    { id: 'VOLLEYBALL', icon: Volleyball },
    { id: 'RUNNING', icon: Footprints },
    { id: 'CYCLING', icon: Bike },
    { id: 'SWIMMING', icon: Waves },
    { id: 'GYM', icon: Dumbbell },
    { id: 'CHESS', icon: Crown },
    { id: 'SKIING', icon: MountainSnow },
    { id: 'SNOWBOARDING', icon: Snowflake },
    { id: 'CLIMBING', icon: Mountain },
    { id: 'RAFTING', icon: Sailboat },
    { id: 'PARAGLIDING', icon: Wind },
    { id: 'HORSE_RIDING', icon: Compass },
    { id: 'FISHING', icon: Fish },
  ],
}

/** Subtype options for a type, or [] if it has none. */
export function subtypesFor(type: EventType): EventSubtypeOption[] {
  return EVENT_SUBTYPES[type] ?? []
}

/** Icon for a stored subtype id, searched across all types (null if unknown). */
export function subtypeIcon(id: string): LucideIcon | null {
  for (const list of Object.values(EVENT_SUBTYPES)) {
    const found = list?.find((s) => s.id === id)
    if (found) return found.icon
  }
  return null
}
