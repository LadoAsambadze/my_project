import { gql } from '@apollo/client/core'
import { EVENT_FIELDS } from './queries'

export const CREATE_EVENT_MUTATION = gql`
  ${EVENT_FIELDS}
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventFields
    }
  }
`

export const UPDATE_EVENT_MUTATION = gql`
  ${EVENT_FIELDS}
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      ...EventFields
    }
  }
`

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`

// Returns the event with recomputed RSVP fields so Apollo updates the cached
// Event (normalized by id) and the UI reacts.
export const RSVP_EVENT_MUTATION = gql`
  mutation RsvpEvent($eventId: ID!, $status: RsvpStatus) {
    rsvpEvent(eventId: $eventId, status: $status) {
      id
      goingCount
      interestedCount
      myRsvp
    }
  }
`
