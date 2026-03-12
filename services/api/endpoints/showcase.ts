import type { Showcase } from '~/types/entities.types'

export const showcaseApi = {
  async getMainPage(): Promise<Showcase> {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBaseUrl
    return $fetch(`${baseUrl}/showcases/showcases/mainpage/web/`)
  }
}
