import { gql } from '@apollo/client/core'

// Everything a work card needs, including the page it belongs to.
export const WORK_FIELDS = gql`
  fragment WorkFields on Work {
    id
    title
    # Aliased: Request.category is a PageType enum, and same-named fields with
    # different types can't be merged inside the FeedItem union selection.
    workCategory: category
    description
    priceFrom
    createdAt
    likesCount
    likedByMe
    commentsCount
    media {
      id
      url
      type
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

// A single page's works, newest first (the Portfolio tab).
export const PAGE_WORKS_QUERY = gql`
  ${WORK_FIELDS}
  query PageWorks($pageId: ID!) {
    pageWorks(pageId: $pageId) {
      ...WorkFields
    }
  }
`

// Browse works across all photo & video pages, optionally by category.
export const WORKS_QUERY = gql`
  ${WORK_FIELDS}
  query Works($category: String) {
    works(category: $category) {
      ...WorkFields
    }
  }
`
