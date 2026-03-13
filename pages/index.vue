<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">{{ showcaseName }}</h1>
      </v-col>
    </v-row>

    <!-- Состояние загрузки -->
    <v-row v-if="loading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3" xl="2">
        <app-skeleton />
      </v-col>
    </v-row>

    <!-- Состояние ошибки -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <error-message :message="error" @retry="loadData" @close="error = null" />
      </v-col>
    </v-row>

    <!-- Сетка с контентом -->
    <v-row v-else>
      <v-col
        v-for="(slide, index) in slides"
        :key="slide.oid || index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <content-card :content="slide.title" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useShowcaseStore } from '~/stores/showcaseStore'
import AppSkeleton from '~/components/ui/AppSkeleton.vue'
import ErrorMessage from '~/components/ui/ErrorMessage.vue'

const showcaseStore = useShowcaseStore()
const { slides, showcaseName, loading, error } = storeToRefs(showcaseStore)

await useAsyncData('showcase', async () => {
  await showcaseStore.fetchMainPage()
  return showcaseStore.data
}, {
  server: true,
  lazy: false,
})

const loadData = () => {
  showcaseStore.fetchMainPage()
}

useHead({
  title: computed(() => showcaseName.value || 'Главная'),
})
</script>
