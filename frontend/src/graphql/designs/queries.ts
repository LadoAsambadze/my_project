import { gql } from '@apollo/client/core'

// Everything a design card needs, including the page it belongs to (for the
// "by <page>" line in the browse grid).
export const DESIGN_FIELDS = gql`
  fragment DesignFields on Design {
    id
    title
    occasion
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

// A single page's designs, newest first (the Designs tab on designer pages).
export const PAGE_DESIGNS_QUERY = gql`
  ${DESIGN_FIELDS}
  query PageDesigns($pageId: ID!) {
    pageDesigns(pageId: $pageId) {
      ...DesignFields
    }
  }
`

// Browse designs across all designer pages, optionally by occasion.
export const DESIGNS_QUERY = gql`
  ${DESIGN_FIELDS}
  query Designs($occasion: String) {
    designs(occasion: $occasion) {
      ...DesignFields
    }
  }
`
