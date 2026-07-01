import { gql } from '@apollo/client/core'
import { FLORIST_ITEM_FIELDS } from './queries'

export const CREATE_FLORIST_ITEM_MUTATION = gql`
  ${FLORIST_ITEM_FIELDS}
  mutation CreateFloristItem($input: CreateFloristItemInput!) {
    createFloristItem(input: $input) {
      ...FloristItemFields
    }
  }
`

export const UPDATE_FLORIST_ITEM_MUTATION = gql`
  ${FLORIST_ITEM_FIELDS}
  mutation UpdateFloristItem($input: UpdateFloristItemInput!) {
    updateFloristItem(input: $input) {
      ...FloristItemFields
    }
  }
`

export const DELETE_FLORIST_ITEM_MUTATION = gql`
  mutation DeleteFloristItem($id: ID!) {
    deleteFloristItem(id: $id)
  }
`
