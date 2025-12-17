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
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }

  const config = useRuntimeConfig()
  const res = await $fetch<TokenResponseDto>('/auth/refresh', {
    baseURL: config.public.apiBase,
    method: 'POST',
    body: { refreshToken }
  })

  const accessExp = new Date(res.AccessTokenExpiryTime).getTime()
  const refreshExp = new Date(res.RefreshTokenExpiryTime).getTime()

  await setUserSession(event, {
    secure: {
      accessToken: res.AccessToken,
      accessExp,
      refreshToken: res.RefreshToken,
      refreshExp
    }
  })

  return {}
})
