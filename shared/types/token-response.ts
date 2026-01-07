export type TokenResponseDto = {
  UserId: string
  RBACVersion: number
  AccessToken: string
  AccessTokenExpiryTime: string | Date
  RefreshToken: string
  RefreshTokenExpiryTime: string | Date
}
