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

  const accessExp = new Date(res.AccessTokenExpiryTime).getTime()
  const refreshExp = new Date(res.RefreshTokenExpiryTime).getTime()

  await setUserSession(event, {
    user: { email },
    secure: {
      accessToken: res.AccessToken,
      accessExp,
      refreshToken: res.RefreshToken,
      refreshExp
    },
    loggedInAt: new Date()
  })

  return {}
})
