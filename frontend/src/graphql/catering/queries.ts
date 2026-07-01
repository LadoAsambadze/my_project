import { gql } from '@apollo/client/core'

// Everything an offer card needs, including the page it belongs to.
export const CATERING_OFFER_FIELDS = gql`
  fragment CateringOfferFields on CateringOffer {
    id
    title
    kind
    description
    pricePerPerson
    createdAt
    images {
      id
      url
      order
    }
    page {
      id
      name
      types
      photoUrl
    }
  }
`

// A single page's offers, newest first (the Menu tab on catering pages).
export const PAGE_CATERING_OFFERS_QUERY = gql`
  ${CATERING_OFFER_FIELDS}
  query PageCateringOffers($pageId: ID!) {
    pageCateringOffers(pageId: $pageId) {
      ...CateringOfferFields
    }
  }
`

// Browse offers across all catering pages, optionally by kind.
export const CATERING_OFFERS_QUERY = gql`
  ${CATERING_OFFER_FIELDS}
  query CateringOffers($kind: String) {
    cateringOffers(kind: $kind) {
      ...CateringOfferFields
    }
  }
`
