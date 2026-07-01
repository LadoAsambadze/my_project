import { gql } from '@apollo/client/core'

// Everything an EventCard needs: details, the host (author + optional page),
// and when it takes place.
export const EVENT_FIELDS = gql`
  fragment EventFields on Event {
    id
    title
    type
    subtype
    description
    location
    coverUrl
    startsAt
    createdAt
    author {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    page {
      id
      name
      types
      photoUrl
    }
  }
`

// A single user's personal events (drives the Events tab on a profile).
export const USER_EVENTS_QUERY = gql`
  ${EVENT_FIELDS}
  query UserEvents($username: String!) {
    userEvents(username: $username) {
      ...EventFields
    }
  }
`

// A single page's events (drives the Events tab on a page detail view).
export const PAGE_EVENTS_QUERY = gql`
  ${EVENT_FIELDS}
  query PageEvents($pageId: ID!) {
    pageEvents(pageId: $pageId) {
      ...EventFields
    }
  }
`

// Everyone's events, newest first — interleaved into the dashboard news feed.
export const EVENTS_FEED_QUERY = gql`
  ${EVENT_FIELDS}
  query EventsFeed {
    eventsFeed {
      ...EventFields
    }
  }
`
