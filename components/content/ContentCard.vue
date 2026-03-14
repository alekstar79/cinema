<template>
  <NuxtLink :to="content?.url" class="content-card-link">
    <v-card
      class="content-card"
      :loading="loading"
      variant="outlined"
    >
      <div class="card-image-container">
        <v-img
          :src="posterUrl"
          :lazy-src="placeholderImage"
          cover
          class="fill-height"
        >
          <template v-slot:placeholder>
            <v-skeleton-loader type="image" class="fill-height" />
          </template>
        </v-img>
      </div>

      <div class="card-content-wrapper">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          {{ content?.title }}
        </v-card-title>

        <v-card-subtitle class="text-caption">
          {{ truncatedSynopsis }}
        </v-card-subtitle>

        <v-card-text>
          <div v-if="resolvedGenres.length" class="mb-2">
            <v-chip
              v-for="genre in resolvedGenres"
              :key="genre.oid"
              size="x-small"
              class="mr-1 mb-1"
              color="primary"
              variant="outlined"
            >
              {{ genre.name }}
            </v-chip>
          </div>

          <div v-if="resolvedLabels.length">
            <v-chip
              v-for="label in resolvedLabels"
              :key="label.oid"
              size="x-small"
              class="mr-1 mb-1"
              color="primary"
              variant="flat"
            >
              {{ label.name }}
            </v-chip>
          </div>

          <div v-if="!resolvedGenres.length && !resolvedLabels.length" class="text-caption text-medium-emphasis">
            Нет жанров и меток
          </div>
        </v-card-text>
      </div>
    </v-card>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem, Genre, Label } from '~/types/entities.types'

const props = defineProps<{
  content?: ContentItem | null
  loading?: boolean
}>()

const posterUrl = computed(() => {
  if (!props.content?.assets) return undefined
  const poster = props.content.assets.find(a =>
    a.asset_type?.toLowerCase() === 'poster'
  )
  if (!poster || !poster.resize_url) return undefined
  return poster.resize_url
    .replace(/\{w\}/g, '300')
    .replace(/\{h\}/g, '450')
})

const truncatedSynopsis = computed(() => {
  const synopsis = props.content?.synopsis
  if (!synopsis) return ''
  const normalized = synopsis.replace(/[\r\n]+/g, ' ')
  return normalized.length > 120 ? normalized.slice(0, 120) + '…' : normalized
})

const resolvedGenres = computed(() => {
  const genres = props.content?.genres
  return Array.isArray(genres) && genres.every(g => typeof g === 'object')
    ? (genres as Genre[])
    : []
})

const resolvedLabels = computed(() => {
  const labels = props.content?.labels
  return Array.isArray(labels) && labels.every(l => typeof l === 'object')
    ? (labels as Label[])
    : []
})

const placeholderImage = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22450%22%20viewBox%3D%220%200%20300%20450%22%3E%3Crect%20width%3D%22300%22%20height%3D%22450%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22monospace%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E'
</script>

<style scoped>
.content-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.content-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

/* 2. Стили для контейнера */
.card-image-container {
  height: 280px;
  flex-shrink: 0;
  position: relative;
}

.card-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
}

/* Add a bit of inner spacing inside the card content blocks. */
.v-card-title,
.v-card-subtitle,
.v-card-text {
  padding-left: 12px;
  padding-right: 12px;
}
</style>
