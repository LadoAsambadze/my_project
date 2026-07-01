import { gql } from '@apollo/client/core'

// ─── Likes ──────────────────────────────────────────────────────────────────

export const LIKE_MUTATION = gql`
  mutation Like($target: ContentTarget!, $targetId: ID!) {
    like(target: $target, targetId: $targetId) {
      targetId
      likesCount
      likedByMe
    }
  }
`

export const UNLIKE_MUTATION = gql`
  mutation Unlike($target: ContentTarget!, $targetId: ID!) {
    unlike(target: $target, targetId: $targetId) {
      targetId
      likesCount
      likedByMe
    }
  }
`

// ─── Comments ───────────────────────────────────────────────────────────────

export const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    id
    body
    createdAt
    author {
      id
      username
      firstName
      lastName
      avatarUrl
    }
  }
`

export const COMMENTS_QUERY = gql`
  ${COMMENT_FIELDS}
  query Comments($target: ContentTarget!, $targetId: ID!) {
    comments(target: $target, targetId: $targetId) {
      ...CommentFields
    }
  }
`

export const ADD_COMMENT_MUTATION = gql`
  ${COMMENT_FIELDS}
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      ...CommentFields
    }
  }
`

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`
