import { gql } from '@apollo/client/core'
import { WORK_FIELDS } from './queries'

export const CREATE_WORK_MUTATION = gql`
  ${WORK_FIELDS}
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      ...WorkFields
    }
  }
`

export const UPDATE_WORK_MUTATION = gql`
  ${WORK_FIELDS}
  mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      ...WorkFields
    }
  }
`

export const DELETE_WORK_MUTATION = gql`
  mutation DeleteWork($id: ID!) {
    deleteWork(id: $id)
  }
`
