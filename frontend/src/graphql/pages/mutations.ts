import { gql } from '@apollo/client/core'
import { PAGE_FIELDS } from './queries'

export const CREATE_PAGE_MUTATION = gql`
  ${PAGE_FIELDS}
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      ...PageFields
    }
  }
`

// Returns the full page so Apollo updates the cached Page (normalized by id)
// and the header/cards react immediately.
export const UPDATE_PAGE_MUTATION = gql`
  ${PAGE_FIELDS}
  mutation UpdatePage($input: UpdatePageInput!) {
    updatePage(input: $input) {
      ...PageFields
    }
  }
`

export const DELETE_PAGE_MUTATION = gql`
  mutation DeletePage($id: ID!) {
    deletePage(id: $id)
  }
`

// Both return the page with its recomputed follower count + follow state, so
// Apollo updates the cached Page (normalized by id) and the UI reacts.
export const FOLLOW_PAGE_MUTATION = gql`
  mutation FollowPage($pageId: ID!) {
    followPage(pageId: $pageId) {
      id
      followersCount
      isFollowedByMe
    }
  }
`

export const UNFOLLOW_PAGE_MUTATION = gql`
  mutation UnfollowPage($pageId: ID!) {
    unfollowPage(pageId: $pageId) {
      id
      followersCount
      isFollowedByMe
    }
  }
`
