<template>
  <v-app-bar app>
    <v-app-bar-title>Кинотеатр</v-app-bar-title>
    <v-btn to="/" exact>Главная</v-btn>
    <v-btn to="/movies">Фильмы</v-btn>
    <v-btn to="/series">Сериалы</v-btn>
    <v-btn to="/shows">Шоу</v-btn>
    <v-spacer />
    <v-text-field
      v-model="searchQuery"
      density="compact"
      variant="outlined"
      placeholder="Поиск"
      hide-details
      @keyup.enter="search"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
const router = useRouter()
const searchQuery = ref('')

const search = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>