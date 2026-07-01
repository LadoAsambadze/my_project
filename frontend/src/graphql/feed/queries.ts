import { gql } from '@apollo/client/core'
import { POST_FIELDS } from '@/graphql/posts/queries'
import { EVENT_FIELDS } from '@/graphql/events/queries'
import { DESIGN_FIELDS } from '@/graphql/designs/queries'
import { CATERING_OFFER_FIELDS } from '@/graphql/catering/queries'
import { OFFERING_FIELDS } from '@/graphql/offerings/queries'
import { WORK_FIELDS } from '@/graphql/works/queries'
import { FLORIST_ITEM_FIELDS } from '@/graphql/florist/queries'
import { REQUEST_FIELDS } from '@/graphql/requests/operations'

// One page of the unified news feed. Every content type carries its full
// card fragment; `nextCursor` feeds the next fetchMore call.
export const FEED_PAGE_QUERY = gql`
  ${POST_FIELDS}
  ${EVENT_FIELDS}
  ${DESIGN_FIELDS}
  ${CATERING_OFFER_FIELDS}
  ${OFFERING_FIELDS}
  ${WORK_FIELDS}
  ${FLORIST_ITEM_FIELDS}
  ${REQUEST_FIELDS}
  query FeedPage($cursor: DateTime, $limit: Int) {
    feedPage(cursor: $cursor, limit: $limit) {
      nextCursor
      hasMore
      items {
        __typename
        ... on Post {
          ...PostFields
        }
        ... on Event {
          ...EventFields
        }
        ... on Design {
          ...DesignFields
        }
        ... on CateringOffer {
          ...CateringOfferFields
        }
        ... on Offering {
          ...OfferingFields
        }
        ... on Work {
          ...WorkFields
        }
        ... on FloristItem {
          ...FloristItemFields
        }
        ... on Request {
          ...RequestFields
        }
      }
    }
  }
`
