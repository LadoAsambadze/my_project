import { gql } from '@apollo/client/core'
import { POST_FIELDS } from './queries'

export const CREATE_POST_MUTATION = gql`
  ${POST_FIELDS}
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFields
    }
  }
`

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`
