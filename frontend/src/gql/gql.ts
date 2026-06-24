/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      id\n      email\n      isVerified\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  \n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.VerifyEmailDocument,
    "\n  mutation ResendVerificationCode($email: String!) {\n    resendVerificationCode(email: $email)\n  }\n": typeof types.ResendVerificationCodeDocument,
    "\n  mutation RequestLoginCode($email: String!) {\n    requestLoginCode(email: $email)\n  }\n": typeof types.RequestLoginCodeDocument,
    "\n  \n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.LoginWithCodeDocument,
    "\n  mutation RequestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email)\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n": typeof types.ResetPasswordDocument,
    "\n  \n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  \n  mutation RefreshToken {\n    refreshToken {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.RefreshTokenDocument,
    "\n  fragment UserFields on User {\n    id\n    email\n    username\n    firstName\n    lastName\n    birthDate\n    bio\n    avatarUrl\n    location\n    role\n    isVerified\n    isActive\n    createdAt\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  \n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n": typeof types.MeDocument,
    "\n  \n  mutation CreatePage($input: CreatePageInput!) {\n    createPage(input: $input) {\n      ...PageFields\n    }\n  }\n": typeof types.CreatePageDocument,
    "\n  mutation DeletePage($id: ID!) {\n    deletePage(id: $id)\n  }\n": typeof types.DeletePageDocument,
    "\n  mutation FollowPage($pageId: ID!) {\n    followPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": typeof types.FollowPageDocument,
    "\n  mutation UnfollowPage($pageId: ID!) {\n    unfollowPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": typeof types.UnfollowPageDocument,
    "\n  fragment PageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n    followersCount\n    isFollowedByMe\n    createdAt\n    owner {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n  }\n": typeof types.PageFieldsFragmentDoc,
    "\n  \n  query MyPages {\n    myPages {\n      ...PageFields\n    }\n  }\n": typeof types.MyPagesDocument,
    "\n  \n  query Pages {\n    pages {\n      ...PageFields\n    }\n  }\n": typeof types.PagesDocument,
    "\n  \n  query Page($id: ID!) {\n    page(id: $id) {\n      ...PageFields\n    }\n  }\n": typeof types.PageDocument,
    "\n  \n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      ...PostFields\n    }\n  }\n": typeof types.CreatePostDocument,
    "\n  mutation DeletePost($id: ID!) {\n    deletePost(id: $id)\n  }\n": typeof types.DeletePostDocument,
    "\n  fragment PostFields on Post {\n    id\n    body\n    createdAt\n    author {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n    page {\n      id\n      name\n      type\n      photoUrl\n    }\n    media {\n      id\n      url\n      type\n    }\n  }\n": typeof types.PostFieldsFragmentDoc,
    "\n  \n  query Feed {\n    feed {\n      ...PostFields\n    }\n  }\n": typeof types.FeedDocument,
    "\n  \n  query UserPosts($username: String!) {\n    userPosts(username: $username) {\n      ...PostFields\n    }\n  }\n": typeof types.UserPostsDocument,
    "\n  \n  query PagePosts($pageId: ID!) {\n    pagePosts(pageId: $pageId) {\n      ...PostFields\n    }\n  }\n": typeof types.PagePostsDocument,
    "\n  \n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation Follow($userId: ID!) {\n    follow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": typeof types.FollowDocument,
    "\n  mutation Unfollow($userId: ID!) {\n    unfollow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": typeof types.UnfollowDocument,
    "\n  fragment ProfilePageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n  }\n": typeof types.ProfilePageFieldsFragmentDoc,
    "\n  \n  \n  query MyProfile {\n    me {\n      ...UserFields\n      followersCount\n      followingCount\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n": typeof types.MyProfileDocument,
    "\n  \n  \n  query UserProfile($username: String!) {\n    user(username: $username) {\n      ...UserFields\n      followersCount\n      followingCount\n      isFollowedByMe\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n": typeof types.UserProfileDocument,
    "\n  fragment FollowUserFields on User {\n    id\n    username\n    firstName\n    lastName\n    avatarUrl\n    isFollowedByMe\n  }\n": typeof types.FollowUserFieldsFragmentDoc,
    "\n  \n  query SearchUsers($query: String!) {\n    searchUsers(query: $query) {\n      ...FollowUserFields\n    }\n  }\n": typeof types.SearchUsersDocument,
    "\n  \n  query Followers($username: String!) {\n    user(username: $username) {\n      id\n      username\n      followers {\n        ...FollowUserFields\n      }\n    }\n  }\n": typeof types.FollowersDocument,
    "\n  \n  query Following($username: String!) {\n    user(username: $username) {\n      id\n      username\n      following {\n        ...FollowUserFields\n      }\n    }\n  }\n": typeof types.FollowingDocument,
};
const documents: Documents = {
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      id\n      email\n      isVerified\n    }\n  }\n": types.RegisterDocument,
    "\n  \n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.VerifyEmailDocument,
    "\n  mutation ResendVerificationCode($email: String!) {\n    resendVerificationCode(email: $email)\n  }\n": types.ResendVerificationCodeDocument,
    "\n  mutation RequestLoginCode($email: String!) {\n    requestLoginCode(email: $email)\n  }\n": types.RequestLoginCodeDocument,
    "\n  \n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.LoginWithCodeDocument,
    "\n  mutation RequestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email)\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n": types.ResetPasswordDocument,
    "\n  \n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  \n  mutation RefreshToken {\n    refreshToken {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.RefreshTokenDocument,
    "\n  fragment UserFields on User {\n    id\n    email\n    username\n    firstName\n    lastName\n    birthDate\n    bio\n    avatarUrl\n    location\n    role\n    isVerified\n    isActive\n    createdAt\n  }\n": types.UserFieldsFragmentDoc,
    "\n  \n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n": types.MeDocument,
    "\n  \n  mutation CreatePage($input: CreatePageInput!) {\n    createPage(input: $input) {\n      ...PageFields\n    }\n  }\n": types.CreatePageDocument,
    "\n  mutation DeletePage($id: ID!) {\n    deletePage(id: $id)\n  }\n": types.DeletePageDocument,
    "\n  mutation FollowPage($pageId: ID!) {\n    followPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": types.FollowPageDocument,
    "\n  mutation UnfollowPage($pageId: ID!) {\n    unfollowPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": types.UnfollowPageDocument,
    "\n  fragment PageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n    followersCount\n    isFollowedByMe\n    createdAt\n    owner {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n  }\n": types.PageFieldsFragmentDoc,
    "\n  \n  query MyPages {\n    myPages {\n      ...PageFields\n    }\n  }\n": types.MyPagesDocument,
    "\n  \n  query Pages {\n    pages {\n      ...PageFields\n    }\n  }\n": types.PagesDocument,
    "\n  \n  query Page($id: ID!) {\n    page(id: $id) {\n      ...PageFields\n    }\n  }\n": types.PageDocument,
    "\n  \n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      ...PostFields\n    }\n  }\n": types.CreatePostDocument,
    "\n  mutation DeletePost($id: ID!) {\n    deletePost(id: $id)\n  }\n": types.DeletePostDocument,
    "\n  fragment PostFields on Post {\n    id\n    body\n    createdAt\n    author {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n    page {\n      id\n      name\n      type\n      photoUrl\n    }\n    media {\n      id\n      url\n      type\n    }\n  }\n": types.PostFieldsFragmentDoc,
    "\n  \n  query Feed {\n    feed {\n      ...PostFields\n    }\n  }\n": types.FeedDocument,
    "\n  \n  query UserPosts($username: String!) {\n    userPosts(username: $username) {\n      ...PostFields\n    }\n  }\n": types.UserPostsDocument,
    "\n  \n  query PagePosts($pageId: ID!) {\n    pagePosts(pageId: $pageId) {\n      ...PostFields\n    }\n  }\n": types.PagePostsDocument,
    "\n  \n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": types.ChangePasswordDocument,
    "\n  mutation Follow($userId: ID!) {\n    follow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": types.FollowDocument,
    "\n  mutation Unfollow($userId: ID!) {\n    unfollow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n": types.UnfollowDocument,
    "\n  fragment ProfilePageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n  }\n": types.ProfilePageFieldsFragmentDoc,
    "\n  \n  \n  query MyProfile {\n    me {\n      ...UserFields\n      followersCount\n      followingCount\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n": types.MyProfileDocument,
    "\n  \n  \n  query UserProfile($username: String!) {\n    user(username: $username) {\n      ...UserFields\n      followersCount\n      followingCount\n      isFollowedByMe\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n": types.UserProfileDocument,
    "\n  fragment FollowUserFields on User {\n    id\n    username\n    firstName\n    lastName\n    avatarUrl\n    isFollowedByMe\n  }\n": types.FollowUserFieldsFragmentDoc,
    "\n  \n  query SearchUsers($query: String!) {\n    searchUsers(query: $query) {\n      ...FollowUserFields\n    }\n  }\n": types.SearchUsersDocument,
    "\n  \n  query Followers($username: String!) {\n    user(username: $username) {\n      id\n      username\n      followers {\n        ...FollowUserFields\n      }\n    }\n  }\n": types.FollowersDocument,
    "\n  \n  query Following($username: String!) {\n    user(username: $username) {\n      id\n      username\n      following {\n        ...FollowUserFields\n      }\n    }\n  }\n": types.FollowingDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      id\n      email\n      isVerified\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      id\n      email\n      isVerified\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResendVerificationCode($email: String!) {\n    resendVerificationCode(email: $email)\n  }\n"): (typeof documents)["\n  mutation ResendVerificationCode($email: String!) {\n    resendVerificationCode(email: $email)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RequestLoginCode($email: String!) {\n    requestLoginCode(email: $email)\n  }\n"): (typeof documents)["\n  mutation RequestLoginCode($email: String!) {\n    requestLoginCode(email: $email)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RequestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email)\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation RefreshToken {\n    refreshToken {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  mutation RefreshToken {\n    refreshToken {\n      accessToken\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment UserFields on User {\n    id\n    email\n    username\n    firstName\n    lastName\n    birthDate\n    bio\n    avatarUrl\n    location\n    role\n    isVerified\n    isActive\n    createdAt\n  }\n"): (typeof documents)["\n  fragment UserFields on User {\n    id\n    email\n    username\n    firstName\n    lastName\n    birthDate\n    bio\n    avatarUrl\n    location\n    role\n    isVerified\n    isActive\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreatePage($input: CreatePageInput!) {\n    createPage(input: $input) {\n      ...PageFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreatePage($input: CreatePageInput!) {\n    createPage(input: $input) {\n      ...PageFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeletePage($id: ID!) {\n    deletePage(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeletePage($id: ID!) {\n    deletePage(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation FollowPage($pageId: ID!) {\n    followPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"): (typeof documents)["\n  mutation FollowPage($pageId: ID!) {\n    followPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UnfollowPage($pageId: ID!) {\n    unfollowPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"): (typeof documents)["\n  mutation UnfollowPage($pageId: ID!) {\n    unfollowPage(pageId: $pageId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment PageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n    followersCount\n    isFollowedByMe\n    createdAt\n    owner {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  fragment PageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n    followersCount\n    isFollowedByMe\n    createdAt\n    owner {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query MyPages {\n    myPages {\n      ...PageFields\n    }\n  }\n"): (typeof documents)["\n  \n  query MyPages {\n    myPages {\n      ...PageFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Pages {\n    pages {\n      ...PageFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Pages {\n    pages {\n      ...PageFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Page($id: ID!) {\n    page(id: $id) {\n      ...PageFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Page($id: ID!) {\n    page(id: $id) {\n      ...PageFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      ...PostFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      ...PostFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeletePost($id: ID!) {\n    deletePost(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeletePost($id: ID!) {\n    deletePost(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment PostFields on Post {\n    id\n    body\n    createdAt\n    author {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n    page {\n      id\n      name\n      type\n      photoUrl\n    }\n    media {\n      id\n      url\n      type\n    }\n  }\n"): (typeof documents)["\n  fragment PostFields on Post {\n    id\n    body\n    createdAt\n    author {\n      id\n      username\n      firstName\n      lastName\n      avatarUrl\n    }\n    page {\n      id\n      name\n      type\n      photoUrl\n    }\n    media {\n      id\n      url\n      type\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Feed {\n    feed {\n      ...PostFields\n    }\n  }\n"): (typeof documents)["\n  \n  query Feed {\n    feed {\n      ...PostFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query UserPosts($username: String!) {\n    userPosts(username: $username) {\n      ...PostFields\n    }\n  }\n"): (typeof documents)["\n  \n  query UserPosts($username: String!) {\n    userPosts(username: $username) {\n      ...PostFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query PagePosts($pageId: ID!) {\n    pagePosts(pageId: $pageId) {\n      ...PostFields\n    }\n  }\n"): (typeof documents)["\n  \n  query PagePosts($pageId: ID!) {\n    pagePosts(pageId: $pageId) {\n      ...PostFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"): (typeof documents)["\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Follow($userId: ID!) {\n    follow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"): (typeof documents)["\n  mutation Follow($userId: ID!) {\n    follow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Unfollow($userId: ID!) {\n    unfollow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"): (typeof documents)["\n  mutation Unfollow($userId: ID!) {\n    unfollow(userId: $userId) {\n      id\n      followersCount\n      isFollowedByMe\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ProfilePageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n  }\n"): (typeof documents)["\n  fragment ProfilePageFields on Page {\n    id\n    name\n    type\n    photoUrl\n    postsCount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  query MyProfile {\n    me {\n      ...UserFields\n      followersCount\n      followingCount\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  \n  query MyProfile {\n    me {\n      ...UserFields\n      followersCount\n      followingCount\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  query UserProfile($username: String!) {\n    user(username: $username) {\n      ...UserFields\n      followersCount\n      followingCount\n      isFollowedByMe\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  \n  query UserProfile($username: String!) {\n    user(username: $username) {\n      ...UserFields\n      followersCount\n      followingCount\n      isFollowedByMe\n      pages {\n        ...ProfilePageFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment FollowUserFields on User {\n    id\n    username\n    firstName\n    lastName\n    avatarUrl\n    isFollowedByMe\n  }\n"): (typeof documents)["\n  fragment FollowUserFields on User {\n    id\n    username\n    firstName\n    lastName\n    avatarUrl\n    isFollowedByMe\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query SearchUsers($query: String!) {\n    searchUsers(query: $query) {\n      ...FollowUserFields\n    }\n  }\n"): (typeof documents)["\n  \n  query SearchUsers($query: String!) {\n    searchUsers(query: $query) {\n      ...FollowUserFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Followers($username: String!) {\n    user(username: $username) {\n      id\n      username\n      followers {\n        ...FollowUserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query Followers($username: String!) {\n    user(username: $username) {\n      id\n      username\n      followers {\n        ...FollowUserFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Following($username: String!) {\n    user(username: $username) {\n      id\n      username\n      following {\n        ...FollowUserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query Following($username: String!) {\n    user(username: $username) {\n      id\n      username\n      following {\n        ...FollowUserFields\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;