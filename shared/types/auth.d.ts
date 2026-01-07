declare module '#auth-utils' {
  interface SecureSessionData {
    refreshToken: string
    refreshExp: number
  }

  interface User {
    email?: string
    accessToken?: string
    accessExp?: number
    userId?: string
    rbacVersion?: number
  }

  interface UserSession {
    user?: User
    loggedInAt?: Date
    secure?: SecureSessionData
  }
}

export {}
