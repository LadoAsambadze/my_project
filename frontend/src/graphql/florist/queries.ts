import { gql } from '@apollo/client/core'

// Everything a florist item card needs, including the page it belongs to.
export const FLORIST_ITEM_FIELDS = gql`
  fragment FloristItemFields on FloristItem {
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

// A single page's catalog, newest first (the Catalog tab on florist pages).
export const PAGE_FLORIST_ITEMS_QUERY = gql`
  ${FLORIST_ITEM_FIELDS}
  query PageFloristItems($pageId: ID!) {
    pageFloristItems(pageId: $pageId) {
      ...FloristItemFields
    }
  }
`

// Browse arrangements across all florist pages, optionally by kind.
export const FLORIST_ITEMS_QUERY = gql`
  ${FLORIST_ITEM_FIELDS}
  query FloristItems($kind: String) {
    floristItems(kind: $kind) {
      ...FloristItemFields
    }
  }
`
