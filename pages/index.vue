<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">{{ showcaseName }}</h1>
      </v-col>
    </v-row>
    <v-row v-if="showcaseStore.loading && !showcaseStore.slides.length">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3" xl="2">
        <app-skeleton />
      </v-col>
    </v-row>
    <v-row v-else-if="showcaseStore.error">
      <v-col cols="12">
        <error-message :message="showcaseStore.error" @retry="showcaseStore.fetchMainPage" />
      </v-col>
    </v-row>
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
import ContentCard from '~/components/content/ContentCard.vue'

const showcaseStore = useShowcaseStore()

await useAsyncData('index-data', () => showcaseStore.fetchMainPage())

const { slides, showcaseName } = storeToRefs(showcaseStore)

useHead({
  title: computed(() => showcaseName.value || 'Главная'),
})
</script>
