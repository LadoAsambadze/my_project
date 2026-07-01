import { gql } from '@apollo/client/core'
import { CATERING_OFFER_FIELDS } from './queries'

export const CREATE_CATERING_OFFER_MUTATION = gql`
  ${CATERING_OFFER_FIELDS}
  mutation CreateCateringOffer($input: CreateCateringOfferInput!) {
    createCateringOffer(input: $input) {
      ...CateringOfferFields
    }
  }
`

export const DELETE_CATERING_OFFER_MUTATION = gql`
  mutation DeleteCateringOffer($id: ID!) {
    deleteCateringOffer(id: $id)
  }
`
