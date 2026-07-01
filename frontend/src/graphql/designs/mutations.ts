import { gql } from '@apollo/client/core'
import { DESIGN_FIELDS } from './queries'

export const CREATE_DESIGN_MUTATION = gql`
  ${DESIGN_FIELDS}
  mutation CreateDesign($input: CreateDesignInput!) {
    createDesign(input: $input) {
      ...DesignFields
    }
  }
`

export const DELETE_DESIGN_MUTATION = gql`
  mutation DeleteDesign($id: ID!) {
    deleteDesign(id: $id)
  }
`
