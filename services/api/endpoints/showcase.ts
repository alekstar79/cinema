import type { Showcase } from '~/types/entities.types'

export const createShowcaseApi = (baseURL: string) => ({
  async getMainPage(): Promise<Showcase> {
    return $fetch(`${baseURL}/showcases/showcases/mainpage/web/`)
  }
})
