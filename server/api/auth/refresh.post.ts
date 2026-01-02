type TokenResponseDto = {
  AccessToken: string
  AccessTokenExpiryTime: string | Date
  RefreshToken: string
  RefreshTokenExpiryTime: string | Date
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const refreshToken = session?.secure?.refreshToken as string | undefined
  if (!refreshToken) {
    console.warn('[auth/refresh] missing refresh token')
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }

  const config = useRuntimeConfig()
  const res = await $fetch<TokenResponseDto>('api/v1/admin/auth/refresh', {
    baseURL: config.public.apiBase,
    method: 'POST',
    body: { refreshToken }
  })

  const accessExp = new Date(res.AccessTokenExpiryTime).getTime()
  const refreshExp = new Date(res.RefreshTokenExpiryTime).getTime()

  await setUserSession(event, {
    loggedInAt: session.loggedInAt || new Date(),
    user: {
      ...(session.user || {}),
      accessToken: res.AccessToken,
      accessExp
    },
    secure: {
      refreshToken: res.RefreshToken,
      refreshExp
    }
  })

  console.log('[auth/refresh] session updated', {
    accessTokenSet: !!res.AccessToken,
    accessExp,
    refreshTokenSet: !!res.RefreshToken,
    refreshExp
  })

  return {}
})
