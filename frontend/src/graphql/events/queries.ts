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
    likesCount
    likedByMe
    commentsCount
    goingCount
    interestedCount
    myRsvp
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

// Everyone's events, newest first — drives the "upcoming" sidebar rail.
export const EVENTS_FEED_QUERY = gql`
  ${EVENT_FIELDS}
  query EventsFeed {
    eventsFeed {
      ...EventFields
    }
  }
`

// A single event with the attendee avatar row (the event detail page).
export const EVENT_QUERY = gql`
  ${EVENT_FIELDS}
  query Event($id: ID!) {
    event(id: $id) {
      ...EventFields
      attendees {
        id
        username
        firstName
        lastName
        avatarUrl
      }
    }
  }
`
