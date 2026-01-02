import { z } from 'zod'

type TokenResponseDto = {
  AccessToken: string
  AccessTokenExpiryTime: string | Date
  RefreshToken: string
  RefreshTokenExpiryTime: string | Date
}

const bodySchema = z.object({
  email: z.email({}),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)
  const config = useRuntimeConfig()

  const res = await $fetch<TokenResponseDto>('api/v1/admin/auth/email-login', {
    baseURL: config.public.apiBase,
    method: 'POST',
    body: { email, password }
  })

  console.log('[auth/login] response', res)

  const accessExp = new Date(res.AccessTokenExpiryTime).getTime()
  const refreshExp = new Date(res.RefreshTokenExpiryTime).getTime()

  await setUserSession(event, {
    user: {
      email,
      accessToken: res.AccessToken,
      accessExp
    },
    secure: {
      refreshToken: res.RefreshToken,
      refreshExp
    },
    loggedInAt: new Date()
  })

  console.log('[auth/login] session set', {
    user: email,
    accessTokenSet: !!res.AccessToken,
    accessExp,
    refreshTokenSet: !!res.RefreshToken,
    refreshExp
  })

  return {}
})
