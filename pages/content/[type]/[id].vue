<template>
  <v-container v-if="content">
    <v-row>
      <v-col cols="12" md="4">
        <v-img
          :src="posterUrl"
          :lazy-src="placeholderImage"
          height="400"
          cover
          class="align-end"
        >
          <template v-slot:placeholder>
            <v-skeleton-loader type="image" />
          </template>
        </v-img>
      </v-col>

      <v-col cols="12" md="8">
        <h1 class="text-h4">{{ content.title }}</h1>
        <p class="text-body-1 mt-2">{{ content.synopsis }}</p>

        <v-divider class="my-4" />

        <div v-if="resolvedGenres.length">
          <strong>Жанры:</strong>
          <v-chip
            v-for="genre in resolvedGenres"
            :key="genre.oid"
            class="mr-1 mt-1"
          >
            {{ genre.name }}
          </v-chip>
        </div>

        <div v-if="resolvedLabels.length" class="mt-2">
          <strong>Метки:</strong>
          <v-chip
            v-for="label in resolvedLabels"
            :key="label.oid"
            class="mr-1 mt-1"
            color="secondary"
          >
            {{ label.name }}
          </v-chip>
        </div>

        <div v-if="content.air_year" class="mt-2">
          <strong>Год:</strong> {{ content.air_year }}
        </div>

        <div v-if="participants.length" class="mt-4">
          <strong>Участники:</strong>
          <v-list density="compact">
            <v-list-item
              v-for="participant in participants"
              :key="participant.person?.oid || participant.person"
            >
              <v-list-item-title>
                <span v-if="participant.person && typeof participant.person === 'object'">
                  {{ participant.person.first_name }} {{ participant.person.last_name }}
                </span>
                <span v-else>
                  {{ participant.person }}
                </span>
                <span v-if="participant.job" class="text-caption text-medium-emphasis ml-2">
                  ({{ formatJob(participant.job) }})
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else-if="loading">
    <v-skeleton-loader type="article" />
  </v-container>

  <v-container v-else>
    <error-message :message="error?.message || 'Произошла ошибка'" @retry="loadData" />
  </v-container>
</template>

<script setup lang="ts">
import type { ContentItem, Genre, Label } from '~/types/entities.types'
import { useDictionaryStore } from '~/stores/dictionaryStore'
import { useShowcaseStore } from '~/stores/showcaseStore'
import { EntityResolver } from '~/services/resolver/entityResolver.service'
import { createDictionariesApi } from '~/services/api/endpoints/dictionaries'
import ErrorMessage from '~/components/ui/ErrorMessage.vue'
import { formatAssetUrl } from '~/utils/asset.helper'

const route = useRoute()
const config = useRuntimeConfig()
const baseURL = config.public.apiBaseUrl
const { type, id } = route.params

const apiType = type === 'movies' ? 'content/movies' :
  type === 'series' ? 'content/series' :
    type === 'shows' ? 'content/shows' : type

const showcaseStore = useShowcaseStore()
const dictionaryStore = useDictionaryStore()

await useAsyncData('showcase-data', async () => {
  await showcaseStore.fetchMainPage()
  return true
}, { server: true, lazy: false })

const dictionariesApi = createDictionariesApi(baseURL)
const resolver = new EntityResolver(dictionaryStore, dictionariesApi.getEntity)

const { data: content, pending: loading, error } = await useAsyncData<ContentItem | null>(
  `content-${apiType}-${id}`,
  async () => {
    const url = `${baseURL}/${apiType}/${id}/`
    try {
      const rawData = await $fetch<ContentItem>(url)
      const resolved = await resolver.resolve(rawData)
      return resolved as ContentItem
    } catch (e) {
      throw e
    }
  },
  { server: true }
)

const loadData = () => {
  window.location.reload()
}

const posterFromDetail = computed(() => {
  if (!content.value?.assets) return undefined
  const poster = content.value.assets.find(a =>
    a.asset_type?.toLowerCase() === 'poster'
  )
  if (!poster || !poster.resize_url) return undefined
  return formatAssetUrl(poster.resize_url, 300, 450)
})

const posterFromShowcase = computed(() => {
  if (!content.value?.oid) return undefined
  const slide = showcaseStore.slides.find(s => s.title.oid === content.value?.oid)
  if (!slide) return undefined
  const poster = slide.title.assets.find(a =>
    a.asset_type?.toLowerCase() === 'poster'
  )
  if (!poster || !poster.resize_url) return undefined
  return formatAssetUrl(poster.resize_url, 300, 450)
})

const posterUrl = computed(() => {
  return posterFromDetail.value || posterFromShowcase.value || undefined
})

const resolvedGenres = computed(() => {
  const genres = content.value?.genres
  return Array.isArray(genres) && genres.every(g => typeof g === 'object')
    ? (genres as Genre[])
    : []
})

const resolvedLabels = computed(() => {
  const labels = content.value?.labels
  return Array.isArray(labels) && labels.every(l => typeof l === 'object')
    ? (labels as Label[])
    : []
})

const participants = computed(() => {
  const parts = (content.value as any)?.participants
  if (!Array.isArray(parts)) return []
  return parts
})

const formatJob = (job: any): string => {
  if (!job) return ''
  if (typeof job === 'object' && job.name) return job.name
  if (typeof job === 'string') return job
  return String(job)
}

const placeholderImage = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22450%22%20viewBox%3D%220%200%20300%20450%22%3E%3Crect%20width%3D%22300%22%20height%3D%22450%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22monospace%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E'

useHead({
  title: computed(() => content.value?.title || 'Загрузка...')
})
</script>
