import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';
import { EventType, RsvpStatus } from '@prisma/client';
import { User } from '../../users/models/user.model';
import { Page } from '../../pages/models/page.model';

registerEnumType(EventType, { name: 'EventType' });
registerEnumType(RsvpStatus, { name: 'RsvpStatus' });

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the event.' })
  title: string;

  @Field(() => EventType, { description: 'Category of the event.' })
  type: EventType;

  @Field(() => String, {
    nullable: true,
    description:
      'Second-level category within `type` (e.g. "TENNIS" for SPORT); null when the type has no subtypes.',
  })
  subtype?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Optional longer description.',
  })
  description?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Optional human-readable location.',
  })
  location?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'URL of the cover photo, served from /uploads.',
  })
  coverUrl?: string | null;

  @Field(() => GraphQLISODateTime, { description: 'When the event takes place.' })
  startsAt: Date;

  @Field(() => User, { description: 'The user who created the event.' })
  author: User;

  @Field(() => Page, {
    nullable: true,
    description:
      'Set when the event is hosted as a page; null for a personal event.',
  })
  page?: Page | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Computed by field resolvers — not on the Prisma object, so optional in TS.
  @Field(() => Int, { description: 'How many users are going.' })
  goingCount?: number;

  @Field(() => Int, { description: 'How many users are interested.' })
  interestedCount?: number;

  @Field(() => RsvpStatus, {
    nullable: true,
    description: "The signed-in viewer's RSVP (null when none).",
  })
  myRsvp?: RsvpStatus | null;

  @Field(() => [User], {
    description: 'A few users who are going (for the avatar row).',
  })
  attendees?: User[];
}
