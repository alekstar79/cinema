<template>
  <v-container>
    <h1>Поиск: "{{ query }}"</h1>
    <v-row v-if="results.length">
      <v-col v-for="item in results" :key="item.oid" cols="12" sm="6" md="4" lg="3">
        <content-card :content="item" />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-alert type="info">Ничего не найдено</v-alert>
      </v-col>
    </v-row>
    <v-pagination v-model="page" :length="totalPages" class="mt-4" />
  </v-container>
</template>

<script setup lang="ts">
import type { ContentItem } from '~/types/entities.types'
import { useShowcaseStore } from '~/stores/showcaseStore'
import ContentCard from '~/components/content/ContentCard.vue'

const route = useRoute()
const router = useRouter()
const showcaseStore = useShowcaseStore()

const query = ref(route.query.q?.toString() || '')
const page = ref(Number(route.query.page) || 1)
const pageSize = 20

const allItems = computed<ContentItem[]>(() => {
  return showcaseStore.slides.map(slide => slide.title).filter(Boolean)
})

const searchResults = computed(() => {
  if (!query.value) return []
  const q = query.value.toLowerCase()
  return allItems.value.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.synopsis?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.ceil(searchResults.value.length / pageSize))

const results = computed(() => {
  const start = (page.value - 1) * pageSize
  return searchResults.value.slice(start, start + pageSize)
})

watch([page], () => {
  const urlQuery: any = {}

  if (query.value) urlQuery.q = query.value
  if (page.value > 1) urlQuery.page = page.value

  router.replace({ query: urlQuery })
})
</script>
