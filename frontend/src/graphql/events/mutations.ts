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

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`
