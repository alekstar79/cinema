<template>
  <v-container v-if="content">
    <v-row>
      <v-col cols="12" md="4">
        <v-img :src="posterUrl" height="400" cover class="align-end" />
      </v-col>
      <v-col cols="12" md="8">
        <h1 class="text-h4">{{ content.title }}</h1>
        <p class="text-body-1 mt-2">{{ content.synopsis }}</p>
        <v-divider class="my-4" />
        <div v-if="resolvedGenres.length">
          <strong>Жанры:</strong>
          <v-chip v-for="genre in resolvedGenres" :key="genre.oid" class="mr-1 mt-1">
            {{ genre.name }}
          </v-chip>
        </div>
        <div v-if="resolvedLabels.length" class="mt-2">
          <strong>Метки:</strong>
          <v-chip v-for="label in resolvedLabels" :key="label.oid" class="mr-1 mt-1" color="secondary">
            {{ label.name }}
          </v-chip>
        </div>
        <div v-if="content.air_year" class="mt-2">
          <strong>Год:</strong> {{ content.air_year }}
        </div>
        <div v-if="participants.length" class="mt-4">
          <strong>Участники:</strong>
          <v-list density="compact">
            <v-list-item v-for="participant in participants" :key="participant.person?.oid || participant.person">
              <v-list-item-title>
                <span v-if="participant.person && typeof participant.person === 'object'">
                  {{ participant.person.first_name }} {{ participant.person.last_name }}
                </span>
                <span v-else>{{ participant.person }}</span>
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
    <error-message :message="error?.message || 'Произошла ошибка'" />
  </v-container>
</template>

<script setup lang="ts">
import type { ContentItem, Genre, Label } from '~/types/entities.types'
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

const resolvedGenres = computed(() => content.value?.genres?.filter(g => typeof g === 'object') as Genre[] || [])
const resolvedLabels = computed(() => content.value?.labels?.filter(l => typeof l === 'object') as Label[] || [])
const participants = computed(() => (content.value as any)?.participants || [])

const formatJob = (job: any): string => (typeof job === 'object' && job.name) ? job.name : String(job || '')

useHead({
  title: computed(() => content.value?.title || 'Загрузка...')
})
</script>
