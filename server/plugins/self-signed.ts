export default defineNitroPlugin(() => {
  if (process.env.NUXT_ALLOW_SELF_SIGNED === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
})
