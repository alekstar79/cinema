<template>
  <v-container>
    <h1 class="text-h4 mb-4">Шоу</h1>
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Фильтры</v-card-title>
          <v-card-text>
            <v-select
              v-model="filters.genre"
              :items="genres"
              item-title="name"
              item-value="oid"
              label="Жанр"
              clearable
              chips
            />
            <v-text-field
              v-model.number="filters.year"
              label="Год"
              type="number"
              clearable
            />
            <v-select
              v-model="sort"
              :items="sortOptions"
              label="Сортировка"
              clearable
            />
            <v-btn color="primary" block @click="applyFilters">Применить</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-row v-if="filteredItems.length">
          <v-col
            v-for="item in filteredItems"
            :key="item.oid"
            cols="12"
            sm="6"
            lg="4"
          >
            <content-card :content="item" />
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12">
            <v-alert type="info">Нет шоу для отображения</v-alert>
          </v-col>
        </v-row>
        <v-pagination
          v-model="page"
          :length="totalPages"
          class="mt-4"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Genre, ContentItem } from '~/types/entities.types'
import { useShowcaseStore } from '~/stores/showcaseStore'
import { useDictionaryStore } from '~/stores/dictionaryStore'
import ContentCard from '~/components/content/ContentCard.vue'

const route = useRoute()
const router = useRouter()
const showcaseStore = useShowcaseStore()
const dictionaryStore = useDictionaryStore()

const genres = computed(() => {
  const allEntities = dictionaryStore.entities
  const genreList: Genre[] = []
  allEntities.forEach((value: any, key: string) => {
    if (key.startsWith('genre:')) {
      genreList.push(value)
    }
  })
  return genreList
})

const allItems = computed<ContentItem[]>(() => {
  return showcaseStore.slides.map(slide => slide.title).filter(Boolean)
})

const shows = computed(() => allItems.value.filter(item => item.oid.startsWith('show:')))

const page = ref(Number(route.query.page) || 1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(shows.value.length / pageSize))

const filters = reactive({
  genre: route.query.genre as string || undefined,
  year: route.query.year ? Number(route.query.year) : undefined,
})
const sort = ref(route.query.sort as string || '')

const sortOptions = [
  { title: 'По умолчанию', value: '' },
  { title: 'По году (новые)', value: '-air_year' },
  { title: 'По году (старые)', value: 'air_year' },
  { title: 'По названию', value: 'title' },
]

const filteredItems = computed(() => {
  let result = shows.value

  if (filters.genre) {
    result = result.filter(item =>
        Array.isArray(item.genres) && item.genres.some(g =>
          typeof g === 'object' && (g as Genre).oid === filters.genre
        )
    )
  }

  if (filters.year) {
    result = result.filter(item => item.air_year === filters.year)
  }

  if (sort.value) {
    const [order, field] = sort.value.startsWith('-')
      ? ['desc', sort.value.slice(1)]
      : ['asc', sort.value]

    result.sort((a, b) => {
      let aVal = a[field as keyof ContentItem]
      let bVal = b[field as keyof ContentItem]
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      if (order === 'asc') return aVal > bVal ? 1 : -1
      else return aVal < bVal ? 1 : -1
    })
  }

  const start = (page.value - 1) * pageSize
  return result.slice(start, start + pageSize)
})

const applyFilters = () => {
  page.value = 1
  updateQuery()
}

const updateQuery = () => {
  const query: any = {}
  if (filters.genre) query.genre = filters.genre
  if (filters.year) query.year = filters.year
  if (sort.value) query.sort = sort.value
  if (page.value > 1) query.page = page.value
  router.replace({ query })
}

watch([page], () => {
  updateQuery()
})
</script>
