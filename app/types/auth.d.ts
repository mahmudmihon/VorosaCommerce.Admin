declare module '#auth-utils' {
  interface SecureSessionData {
    accessToken: string
    accessExp: number
    refreshToken: string
    refreshExp: number
  }
  interface User {
    email?: string
  }
  interface UserSession {
    user?: User
    loggedInAt?: Date
    secure?: SecureSessionData
  }
}
export {}
