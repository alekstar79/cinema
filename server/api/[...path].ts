export default defineEventHandler(async (event) => {
  const path = event.path.replace(/^\/api\//, '')
  const target = `https://cms.test.ksfr.tech/api/v1/${path}`

  return proxyRequest(event, target)
})
