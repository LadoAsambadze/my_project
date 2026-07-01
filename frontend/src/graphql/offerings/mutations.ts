import { gql } from '@apollo/client/core'
import { OFFERING_FIELDS } from './queries'

export const CREATE_OFFERING_MUTATION = gql`
  ${OFFERING_FIELDS}
  mutation CreateOffering($input: CreateOfferingInput!) {
    createOffering(input: $input) {
      ...OfferingFields
    }
  }
`

export const UPDATE_OFFERING_MUTATION = gql`
  ${OFFERING_FIELDS}
  mutation UpdateOffering($input: UpdateOfferingInput!) {
    updateOffering(input: $input) {
      ...OfferingFields
    }
  }
`

export const DELETE_OFFERING_MUTATION = gql`
  mutation DeleteOffering($id: ID!) {
    deleteOffering(id: $id)
  }
`
