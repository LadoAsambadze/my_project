import { gql } from '@apollo/client/core'

// Everything a request card needs.
export const REQUEST_FIELDS = gql`
  fragment RequestFields on Request {
    id
    category
    occasion
    eventDate
    city
    budgetFrom
    budgetTo
    body
    createdAt
    likesCount
    likedByMe
    commentsCount
    author {
      id
      username
      firstName
      lastName
      avatarUrl
    }
  }
`

// Browse requests, optionally by vendor category.
export const REQUESTS_QUERY = gql`
  ${REQUEST_FIELDS}
  query Requests($category: PageType) {
    requests(category: $category) {
      ...RequestFields
    }
  }
`

// Vendor inbox: requests matching the categories of the viewer's pages.
export const REQUESTS_FOR_MY_PAGES_QUERY = gql`
  ${REQUEST_FIELDS}
  query RequestsForMyPages {
    requestsForMyPages {
      ...RequestFields
    }
  }
`

export const CREATE_REQUEST_MUTATION = gql`
  ${REQUEST_FIELDS}
  mutation CreateRequest($input: CreateRequestInput!) {
    createRequest(input: $input) {
      ...RequestFields
    }
  }
`

export const DELETE_REQUEST_MUTATION = gql`
  mutation DeleteRequest($id: ID!) {
    deleteRequest(id: $id)
  }
`
