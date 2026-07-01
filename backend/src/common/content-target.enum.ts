import { registerEnumType } from '@nestjs/graphql';

/// Every kind of content a user can like or comment on. Shared by the likes
/// and comments modules; each value maps to one nullable FK column on the
/// Like / Comment tables.
export enum ContentTarget {
  POST = 'POST',
  EVENT = 'EVENT',
  DESIGN = 'DESIGN',
  CATERING_OFFER = 'CATERING_OFFER',
  OFFERING = 'OFFERING',
  WORK = 'WORK',
  FLORIST_ITEM = 'FLORIST_ITEM',
  REQUEST = 'REQUEST',
}

registerEnumType(ContentTarget, { name: 'ContentTarget' });

/// The Like/Comment column that holds the target's id, per target type.
export const CONTENT_TARGET_FIELD: Record<ContentTarget, string> = {
  [ContentTarget.POST]: 'postId',
  [ContentTarget.EVENT]: 'eventId',
  [ContentTarget.DESIGN]: 'designId',
  [ContentTarget.CATERING_OFFER]: 'cateringOfferId',
  [ContentTarget.OFFERING]: 'offeringId',
  [ContentTarget.WORK]: 'workId',
  [ContentTarget.FLORIST_ITEM]: 'floristItemId',
  [ContentTarget.REQUEST]: 'requestId',
}