import { gql } from '@apollo/client/core'

// Everything an offering card needs, including the page it belongs to.
export const OFFERING_FIELDS = gql`
  fragment OfferingFields on Offering {
    id
    title
    kind
    description
    priceFrom
    createdAt
    likesCount
    likedByMe
    commentsCount
    images {
      id
      url
      order
    }
    page {
      id
      name
      types
      photoUrl
    }
  }
`

// A single page's offerings, newest first (the Services tab).
export const PAGE_OFFERINGS_QUERY = gql`
  ${OFFERING_FIELDS}
  query PageOfferings($pageId: ID!) {
    pageOfferings(pageId: $pageId) {
      ...OfferingFields
    }
  }
`

// Browse offerings across all musician/equipment pages, optionally by kind.
export const OFFERINGS_QUERY = gql`
  ${OFFERING_FIELDS}
  query Offerings($kind: String) {
    offerings(kind: $kind) {
      ...OfferingFields
    }
  }
`
