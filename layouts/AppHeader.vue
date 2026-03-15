<template>
  <v-app-bar app>
    <v-app-bar-title class="text-h5 font-weight-bold">
      🎬 Кинотеатр
    </v-app-bar-title>

    <v-btn to="/" exact class="nav-btn">Главная</v-btn>
    <v-btn to="/movies" class="nav-btn">Фильмы</v-btn>
    <v-btn to="/series" class="nav-btn">Сериалы</v-btn>
    <v-btn to="/shows" class="nav-btn">Шоу</v-btn>

    <v-spacer />

    <v-text-field
      v-model="searchQuery"
      density="compact"
      variant="outlined"
      placeholder="Поиск"
      hide-details
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mx-4"
      style="max-width: 300px;"
      @keyup.enter="search"
    />

    <v-btn icon @click="themeStore.toggleTheme">
      <v-icon>{{ themeStore.currentTheme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/themeStore'

const router = useRouter()
const searchQuery = ref('')
const themeStore = useThemeStore()

const search = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>

<style scoped>
.nav-btn {
  transition: transform 0.2s;
}
.nav-btn:hover {
  transform: scale(1.05);
}
</style>
