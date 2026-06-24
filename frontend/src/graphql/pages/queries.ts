import { gql } from '@apollo/client/core'

// Everything a page card / header needs.
export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    id
    name
    type
    photoUrl
    postsCount
    followersCount
    isFollowedByMe
    createdAt
    owner {
      id
      username
      firstName
      lastName
      avatarUrl
    }
  }
`

// The signed-in user's own pages (drives the "My pages" list).
export const MY_PAGES_QUERY = gql`
  ${PAGE_FIELDS}
  query MyPages {
    myPages {
      ...PageFields
    }
  }
`

// Browse every page, newest first.
export const PAGES_QUERY = gql`
  ${PAGE_FIELDS}
  query Pages {
    pages {
      ...PageFields
    }
  }
`

// A single page by id (page detail header).
export const PAGE_QUERY = gql`
  ${PAGE_FIELDS}
  query Page($id: ID!) {
    page(id: $id) {
      ...PageFields
    }
  }
`
