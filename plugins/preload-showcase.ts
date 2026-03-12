import { useShowcaseStore } from '~/stores/showcaseStore'

export default defineNuxtPlugin(async () => {
  const showcaseStore = useShowcaseStore()

  if (!showcaseStore.data) {
    await showcaseStore.fetchMainPage()
  }
})
