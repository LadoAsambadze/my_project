// The access token lives in memory only. The refresh token is an httpOnly
// cookie we never read; on reload the auth context exchanges it for a new
// access token via the refreshToken mutation.
let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string) => {
  accessToken = token
}
export const clearAccessToken = () => {
  accessToken = null
}
