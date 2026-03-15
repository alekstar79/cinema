<template>
  <div v-if="content">
    <v-img
      :src="backdropUrl"
      :lazy-src="placeholderImage"
      class="backdrop-image"
      gradient="to top, rgba(var(--v-theme-surface), 1) 10%, rgba(var(--v-theme-surface), 0.7) 30%, transparent 60%"
      height="450px"
      cover
    />
    <v-container class="content-container">
      <v-row>
        <v-col cols="12" md="4" class="poster-column">
          <v-card class="poster-card" elevation="10">
            <v-img :src="posterUrl" :lazy-src="placeholderImage" cover height="100%" />
          </v-card>
        </v-col>
        <v-col cols="12" md="8" class="info-column">
          <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-2" />
          <h1 class="text-h3 font-weight-bold">{{ content.title }}</h1>
          <div class="d-flex align-center my-4">
            <v-rating
              v-if="content.rating"
              :model-value="content.rating / 2"
              color="amber"
              density="compact"
              half-increments
              readonly
              size="small"
              class="mr-2"
            />
            <span v-if="content.rating" class="text-h6 font-weight-medium">{{ content.rating.toFixed(1) }}</span>
            <v-chip v-if="content.air_year" class="ml-4" size="small">{{ content.air_year }}</v-chip>
          </div>

          <div class="mb-4">
            <v-chip
              v-for="genre in resolvedGenres"
              :key="genre.oid"
              class="mr-2 mb-2"
              color="secondary"
              variant="flat"
            >
              {{ genre.name }}
            </v-chip>
          </div>

          <v-tabs v-model="tab" bg-color="transparent" color="primary" class="mb-4">
            <v-tab value="synopsis">Описание</v-tab>
            <v-tab value="cast">Актеры и съемочная группа</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="synopsis">
              <!-- ИСПРАВЛЕНИЕ: Используем displaySynopsis -->
              <p v-if="displaySynopsis" class="text-body-1" style="white-space: pre-wrap;">
                {{ displaySynopsis }}
              </p>
              <v-alert v-else type="info" variant="tonal" class="mt-4">
                Описание для этого материала пока отсутствует.
              </v-alert>
            </v-window-item>
            <v-window-item value="cast">
              <v-list v-if="participants.length" lines="two" class="bg-transparent">
                <v-list-item
                  v-for="participant in participants"
                  :key="participant.person?.oid || participant.person"
                  :prepend-avatar="getPersonAvatar(participant.person)"
                >
                  <v-list-item-title class="font-weight-bold">
                    <span v-if="participant.person && typeof participant.person === 'object'">
                      {{ participant.person.first_name }} {{ participant.person.last_name }}
                    </span>
                    <span v-else>{{ participant.person }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="participant.job" class="text-medium-emphasis">
                    {{ formatJob(participant.job) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal" class="mt-4">
                Информация об актерах и съемочной группе отсутствует.
              </v-alert>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <v-container v-else-if="loading">
    <v-skeleton-loader type="article, image" />
  </v-container>
  <v-container v-else>
    <error-message :message="error?.message || 'Произошла ошибка'" />
  </v-container>
</template>

<script setup lang="ts">
import type { ContentItem, Genre, Label, Person } from '~/types/entities.types'
import { useShowcaseStore } from '~/stores/showcaseStore'
import ErrorMessage from '~/components/ui/ErrorMessage.vue'
import { formatAssetUrl } from '~/utils/asset.helper'

const route = useRoute()
const { type, id } = route.params
const showcaseStore = useShowcaseStore()

const [contentResult] = await Promise.all([
  useAsyncData<ContentItem | null>(`content-${type}-${id}`, () => $fetch(`/api/content/${type}/${id}`)),
  useAsyncData('main-data', () => showcaseStore.fetchMainPage())
])

const { data: content, pending: loading, error } = contentResult

const posterFromDetail = computed(() => {
  const poster = content.value?.assets?.find(a => a.asset_type?.toLowerCase() === 'poster')
  return poster?.resize_url ? formatAssetUrl(poster.resize_url, 300, 450) : undefined
})

const posterFromShowcase = computed(() => {
  if (!content.value?.oid) return undefined
  const slide = showcaseStore.slides.find(s => s.title.oid === content.value?.oid)
  const poster = slide?.title.assets.find(a => a.asset_type?.toLowerCase() === 'poster')
  return poster?.resize_url ? formatAssetUrl(poster.resize_url, 300, 450) : undefined
})

const posterUrl = computed(() => {
  return posterFromDetail.value || posterFromShowcase.value
})

const synopsisFromShowcase = computed(() => {
  if (!content.value?.oid) return undefined
  const slide = showcaseStore.slides.find(s => s.title.oid === content.value.oid)
  return slide?.title.synopsis
})

const displaySynopsis = computed(() => {
  return content.value?.synopsis || synopsisFromShowcase.value
})

const resolvedGenres = computed(() => content.value?.genres?.filter(g => typeof g === 'object') as Genre[] || [])
const resolvedLabels = computed(() => content.value?.labels?.filter(l => typeof l === 'object') as Label[] || [])
const participants = computed(() => (content.value as any)?.participants || [])

const formatJob = (job: any): string => (typeof job === 'object' && job.name) ? job.name : String(job || '')

useHead({
  title: computed(() => content.value?.title || 'Loading…')
})

const tab = ref('synopsis')

const placeholderImage = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22600%22%20viewBox%3D%220%200%20400%20600%22%3E%3Crect%20width%3D%22400%22%20height%3D%22600%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E'

const backdropUrl = computed(() => {
  const backdrop = content.value?.assets?.find(a => a.asset_type?.toLowerCase() === 'backdrop' || a.asset_type?.toLowerCase() === 'promo')
  return backdrop?.resize_url ? formatAssetUrl(backdrop.resize_url, 1280, 720) : posterUrl.value
})

const getPersonAvatar = (person: Person | string | undefined): string | undefined => {
  if (typeof person !== 'object' || !person?.assets) return undefined
  const avatar = person.assets.find(a => a.asset_type?.toLowerCase() === 'avatar')
  return avatar?.resize_url ? formatAssetUrl(avatar.resize_url, 40, 40) : undefined
}

const breadcrumbLinks: Record<string, { title: string; path: string }> = {
  movie: { title: 'Фильмы', path: '/movies' },
  series: { title: 'Сериалы', path: '/series' },
  show: { title: 'Шоу', path: '/shows' },
}

const breadcrumbs = computed(() => {
  const typeName = route.params.type as string
  const breadcrumbType = typeName === 'shows' ? 'show' : (typeName === 'series' ? 'series' : 'movie')
  const linkInfo = breadcrumbLinks[breadcrumbType] || { title: typeName, path: `/${typeName}` }

  return [
    { title: 'Главная', to: '/' },
    { title: linkInfo.title, to: linkInfo.path },
    { title: content.value?.title || '', disabled: true },
  ]
})

watch(content, () => {
  tab.value = 'synopsis'
})
</script>

<style scoped>
.backdrop-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
}
.content-container {
  position: relative;
  z-index: 1;
  padding-top: 150px;
}
.poster-column {
  margin-top: -100px;
}
.poster-card {
  border-radius: 16px;
  height: 500px;
  width: 100%;
  max-width: 340px;
}
.info-column {
  padding-left: 32px;
}
</style>
